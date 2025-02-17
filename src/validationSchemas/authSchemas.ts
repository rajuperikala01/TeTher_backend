import zod from "zod";

export const signupSchema = zod.object({
  firstName: zod
    .string()
    .min(3, "First Name should caontain atleast 3 characters long"),
  lastName: zod
    .string()
    .min(3, "First Name should caontain atleast 3 characters long"),
  email: zod.string().email("Enter a Valid Email"),
  password: zod.string().min(6, "Password must be atleast 6 characters"),
});

export const signInSchema = zod.object({
  email: zod.string().email("Enter a Valid Email"),
  password: zod.string().min(6, "Password Must be atleast 6 characters"),
});
