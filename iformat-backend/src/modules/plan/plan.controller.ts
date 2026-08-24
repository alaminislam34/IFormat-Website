import { Request, Response } from "express";
import { PlanService } from "./plan.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { CreatePlanDto, UpdatePlanDto, PlanFilterQuery } from "./plan.types.js";

export class PlanController {
  static async list(req: Request, res: Response) {
    const filters: PlanFilterQuery = req.query as any;
    const plans = await PlanService.listPlans(filters);
    return ApiResponse.success(res, "Membership plans retrieved successfully", plans);
  }

  static async getById(req: Request, res: Response) {
    const plan = await PlanService.getPlanByIdOrCode(req.params.id);
    return ApiResponse.success(res, "Plan details retrieved successfully", plan);
  }

  static async create(req: Request, res: Response) {
    const data: CreatePlanDto = req.body;
    const plan = await PlanService.createPlan(data);
    return ApiResponse.success(res, "Plan created successfully", plan, 201);
  }

  static async update(req: Request, res: Response) {
    const data: UpdatePlanDto = req.body;
    const plan = await PlanService.updatePlan(req.params.id, data);
    return ApiResponse.success(res, "Plan updated successfully", plan);
  }
}
