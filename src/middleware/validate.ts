import { NextFunction, Request, Response } from "express";
import { ObjectSchema, ValidationError } from "yup";

interface ValidationSchemas {
    body?: ObjectSchema<any>;
    params?: ObjectSchema<any>;
    query?: ObjectSchema<any>;
}

const validate = (schemas: ValidationSchemas) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true,
                });
            }

            if (schemas.params) {
                req.params = await schemas.params.validate(req.params, {
                    abortEarly: false,
                    stripUnknown: true,
                });
            }

            if (schemas.query) {
                req.query = await schemas.query.validate(req.query, {
                    abortEarly: false,
                    stripUnknown: true,
                });
            }

            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors,
                });
                return;
            }
            next(error);
        }
    };
};

export default validate;
