import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken {
  id: string;
  email: string;
  username: string;
}

export async function verifyToken(): Promise<{ success: boolean; userId?: string; error?: NextResponse }> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth-token");

    if (!token) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: "No authentication token found" },
          { status: 401 }
        )
      };
    }

    // Verify the JWT token using jose
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token.value, secret);

    

    return {
      success: true,
      userId: (payload as unknown as DecodedToken).id
    };
  } catch (error) {
    console.error("Token verification error:", error);

    return {
      success: false,
      error: NextResponse.json(
        { success: false, message: "Invalid or expired authentication token" },
        { status: 401 }
      )
    };
  }
}
