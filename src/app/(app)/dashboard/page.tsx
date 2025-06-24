'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Message } from '@/model/User'
import { ApiResponse } from '@/types/ApiResponse'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, RefreshCcw, Copy, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  })

  const { register, watch, setValue } = form
  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Error', {
        description: axiosError.response?.data.message || 'Failed to fetch message settings',
        className: 'bg-red-500',
      })
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast('Refreshed', { description: 'Latest messages fetched' })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Error', {
        description: axiosError.response?.data.message || 'Failed to fetch messages',
        className: 'bg-red-500',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return
    fetchMessages()
    fetchAcceptMessage()
  }, [session, fetchMessages, fetchAcceptMessage])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages)
      toast(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast('Error', {
        description: axiosError.response?.data.message || 'Failed to update settings',
        className: 'bg-red-500',
      })
    }
  }

  const handleDeleteMessage = async () => {
  if (!messageToDelete) return
  try {
    await axios.delete(`/api/delete-message/${messageToDelete}`)
    setMessages((prev) => prev.filter((m) => m._id !== messageToDelete))
    toast('Message deleted')
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>
    toast('Error', {
      description: axiosError.response?.data.message || 'Failed to delete message',
      className: 'bg-red-500',
    })
  } finally {
    setMessageToDelete(null) // reset state
  }
}


  const { username } = session?.user ?? {}
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''
  const profileUrl = `${baseUrl}/u/${username}`

  const [copied, setCopied] = useState(false)
  const copyToClipboard = () => {
  navigator.clipboard.writeText(profileUrl)
  setCopied(true)
  toast('Copied', { description: 'Profile URL copied to clipboard' })
  setTimeout(() => setCopied(false), 3000)
}

  if (!session?.user) return <div className="p-6 text-center">Please login to access your dashboard.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>

      {/* Section: Shareable Profile Link */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Your Profile Link</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input value={profileUrl} disabled className="flex-1 text-sm" />
          <Button onClick={copyToClipboard} variant="secondary" className="shrink-0 gap-2">
            <Copy className="h-4 w-4" />
            {copied ? 'copied' : 'copy'}
        </Button>
        </div>
      </section>

      {/* Section: Message Accept Toggle */}
      <section className="flex items-center gap-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="text-sm text-muted-foreground">
          Accepting Messages: <strong>{acceptMessages ? 'Enabled' : 'Disabled'}</strong>
        </span>
      </section>

      <Separator />

      {/* Section: Refresh Button */}
      <section>
        <Button
          variant="outline"
          onClick={() => fetchMessages(true)}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              Refresh Messages
            </>
          )}
        </Button>
      </section>

      {/* Section: Messages */}
      <section className="flex flex-wrap gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Card key={message._id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] shadow-md hover:shadow-lg transition-all border border-muted">
              <CardHeader>
                <CardTitle className="text-base text-primary">Anonymous Message</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-800 whitespace-pre-wrap">
                {message.content}
                <div className="flex justify-end mt-4">
                  <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setMessageToDelete(message._id)}
    >
      <Trash2 className="w-4 h-4 mr-1" /> Delete
    </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Do you really want to delete this anonymous message?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMessage}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center w-full">No messages yet.</p>
        )}
      </section>
    </div>
  )
}

export default Dashboard
