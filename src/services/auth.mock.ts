export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string; // 6-digit code
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const mockUser = {
  id: "USR-1029",
  firstName: "Admin",
  lastName: "User",
  email: "admin@asianinstitute.edu",
  role: "Principal",
  token: "mock-jwt-token-xyz"
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authServiceMock = {
  login: async (payload: LoginPayload) => {
    await delay(800);
    if (payload.email && payload.password) {
      return { success: true, data: mockUser };
    }
    throw new Error("Invalid credentials");
  },

  register: async (payload: RegisterPayload) => {
    await delay(800);
    return { success: true, message: "Registration successful" };
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    await delay(800);
    if (payload.otp === "123456") {
      return { success: true, message: "OTP verified" };
    }
    throw new Error("Invalid OTP");
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    await delay(800);
    return { success: true, message: "Reset link sent" };
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    await delay(800);
    return { success: true, message: "Password reset successful" };
  }
};
