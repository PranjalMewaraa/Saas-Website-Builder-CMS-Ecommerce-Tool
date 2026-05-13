import { z } from "zod";

export const LoginFormV1Schema = z.object({
  title: z.string().optional().default("Sign in"),
  subtitle: z.string().optional(),
  emailLabel: z.string().optional().default("Email"),
  passwordLabel: z.string().optional().default("Password"),
  submitText: z.string().optional().default("Sign in"),
  signupHref: z.string().optional().default("/account/signup"),
  signupText: z.string().optional().default("Create an account"),
  redirectTo: z.string().optional().default("/account"),
  contentWidth: z.string().optional(),
});

export const SignupFormV1Schema = z.object({
  title: z.string().optional().default("Create your account"),
  subtitle: z.string().optional(),
  nameLabel: z.string().optional().default("Name"),
  emailLabel: z.string().optional().default("Email"),
  passwordLabel: z.string().optional().default("Password"),
  submitText: z.string().optional().default("Create account"),
  loginHref: z.string().optional().default("/account/login"),
  loginText: z.string().optional().default("Already have an account? Sign in"),
  redirectTo: z.string().optional().default("/account"),
  contentWidth: z.string().optional(),
});

export const AccountDashboardV1Schema = z.object({
  greeting: z.string().optional().default("Hello"),
  showRecentOrders: z.boolean().optional().default(true),
  ordersHref: z.string().optional().default("/account/orders"),
  ordersText: z.string().optional().default("View all orders"),
  logoutText: z.string().optional().default("Sign out"),
  contentWidth: z.string().optional(),
});

export const OrderHistoryV1Schema = z.object({
  title: z.string().optional().default("Your orders"),
  emptyText: z.string().optional().default("You haven't placed any orders yet."),
  contentWidth: z.string().optional(),
});

export const LogoutButtonV1Schema = z.object({
  label: z.string().optional().default("Sign out"),
  redirectTo: z.string().optional().default("/"),
  variant: z.enum(["link", "button"]).optional().default("button"),
});
