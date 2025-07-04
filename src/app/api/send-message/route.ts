import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User";

export async function POST(request:Request){
    await dbConnect()
    const {username,content}=await request.json()
    try{
       const user=await UserModel.findOne({username})
       if(!user){
         return Response.json(
            {
                success:false,
                message: "User not found"
            },
            {status:404}
        )
       }

       //is user accepting messages
       if(!user.isAccepting){
         return Response.json(
            {
                success:false,
                message: "User is not accepting the messages"
            },
            {status:403}
        )
       }
       const newMessage={content,createdAt:new Date()}
       user.messages.push(newMessage as Message)
       await user.save()
        return Response.json(
            {
                success:true,
                message: "Message sent successfully"
            },
            {status:200}
        )
    }catch(error){
        console.log("Error adding messages",error)
          return Response.json(
            {
                success:false,
                message: "Internal server error"
            },
            {status:500}
        )
    }
}