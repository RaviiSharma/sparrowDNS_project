"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { signupSchema } from "@/lib/validations/signupSchema"
import {useRouter} from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useRegisterMutation } from "@/store/api/auth"
import Link from "next/link"


const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const [registerUser, { isLoading }] = useRegisterMutation()

  // 1. Define your form.
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof signupSchema>) {
 
    try {
      const response = await registerUser(values).unwrap()
      toast.success("Account created successfully!")
      
      // Store user data in auth context
      login(response.user)
      
      router.push("/")
      // Handle successful signup (redirect, store token, etc.)
    } catch (error: any) {
      console.error('Signup failed:', error)
      const errorMessage = error?.data?.message || "Signup failed. Please try again."
      toast.error(errorMessage)
      // Handle signup error (show error message, etc.)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
     
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
        <p className="text-gray-500">Create your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="Enter your username" 
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password" 
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      {...field} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password ?
            </a>
          </div>

          {/* Sign Up Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </form>
      </Form>
    </div>
  )
}

export default SignupForm