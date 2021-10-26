import { PathParams } from "@tsed/common";
import { Controller } from "@tsed/di";
import { NotFound } from "@tsed/exceptions";
import { UseBeforeEach } from "@tsed/platform-middlewares";
import { Get } from "@tsed/schema";
import { prisma } from "../../../lib/prisma";
import { IsAuth, IsAdmin } from "../../../middlewares";

const include = {
  rank: true,
  department: true,
  citizen: {
    select: {
      id: true,
      name: true,
      surname: true,
    },
  },
  division: {
    include: {
      value: true,
    },
  },
  status: {
    include: {
      value: true,
    },
  },
};

@UseBeforeEach(IsAuth, IsAdmin)
@Controller("/units")
export class ManageUnitsController {
  @Get("/")
  async getUnits() {
    const units = await Promise.all([
      (await prisma.officer.findMany({ include })).map((v) => ({ ...v, type: "OFFICER" })),
      (await prisma.emsFdDeputy.findMany({ include })).map((v) => ({ ...v, type: "DEPUTY" })),
    ]);

    return units.flat(1);
  }

  @Get("/:id")
  async getUnit(@PathParams("id") id: string) {
    let unit: any = await prisma.officer.findUnique({
      where: { id },
      include,
    });

    if (!unit) {
      unit = await prisma.emsFdDeputy.findUnique({
        where: { id },
        include,
      });
    }

    if (!unit) {
      throw new NotFound("unitNotFound");
    }

    return unit;
  }
}
