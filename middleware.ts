import { NextRequest,NextResponse } from "next/server";
export {default} from "next-auth/middleware"
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/"]

export async function middleware(request: NextRequest){
    const token = await getToken({req:request,secret:process.env.NEXTAUTH_SECRET});
    const url = request.url;
    console.log("Line 10 " , url)
    const isProtectedPath = protectedPaths.some((path)=> url.includes(path));

    if(isProtectedPath && !token){
        // Redirect to the login page if no token is found
        return NextResponse.redirect(new URL("/login",url));
    }

    return NextResponse.next();
}

export const config = {
    matcher:[                  // Protect specific paths
        // '/login',
        '/signup',
        '/',
        '/dashboard/:path*',
        '/servers/:path',
    ]                                  
}