import * as yup from "yup";

export const updateProfileSchema = yup.object({
    name: yup.string().optional().trim().min(2).max(100),
    phone: yup.string().optional().trim(),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
});
