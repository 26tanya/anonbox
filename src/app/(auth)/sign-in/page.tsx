'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { toast } from "sonner"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"

function SignIn() {
 
  const router=useRouter();
  
  //zod implmementaon
  const form=useForm<z.infer<typeof signInSchema>>({
    resolver:zodResolver(signInSchema),
    defaultValues:{
      identifier: '',
      password:''
    }
  })
  
  const onSubmit=async(data:z.infer<typeof signInSchema>)=>{
    const result=await signIn('credentials',{
      redirect:false,
      identifier:data.identifier,
      password:data.password
    })
    if(result?.error){
      toast('Signup failed', {
          description: "Incorrect username or password",
          className: "bg-red-600 text-white",
        });
    }
    if(result?.url){
      router.replace('/dashboard')
    }
  }
  return (
    
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            AnonBox: Your secret message box is here!
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          <FormField
            name="identifier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email/Username</FormLabel>
                <FormControl>
                  <Input placeholder="email/username" {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field}  
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-black text-white hover:cursor-pointer">
            Sign in
          </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            No account yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
            Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn


