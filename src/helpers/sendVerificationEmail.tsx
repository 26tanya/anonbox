import {resend} from "../lib/resend"
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse"

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
): Promise<ApiResponse>{
    try{
        console.log("called");
        const a=await resend.emails.send({
            from:'onboarding@resend.dev',
            to:email,
            subject:'AnonBox | Verification Code',
            react: VerificationEmail({username, otp:verifyCode}),
        });
        console.log("returned",a);
        return {success:true,message:'Verification email sent successfully'}
    }catch(emailError){
        console.log("Error sending verification Email",emailError);
        return {success:false,message:'Failed to send verification email'}
    }
}