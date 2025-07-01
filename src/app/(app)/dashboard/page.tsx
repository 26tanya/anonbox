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
import MessageSkeletonCard from '@/components/MessageSkeletonCard'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, RefreshCcw, Copy } from 'lucide-react'

import MessageCard from '@/components/MessageCard'

function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

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
        className: 'bg-red-500 text-white',
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
        className: 'bg-red-500 text-white',
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
        className: 'bg-red-500 text-white',
      })
    }
  }

  const { username } = session?.user ?? {}
  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : ''
  const profileUrl = `${baseUrl}/u/${username}`

  const [copied, setCopied] = useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    toast('Copied', { description: 'Profile URL copied to clipboard' })
    setTimeout(() => setCopied(false), 3000)
  }

  if (!session?.user)
    return (
      <div className="p-6 text-center bg-white text-black min-h-screen">
        Please login to access your dashboard.
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-12 py-8 space-y-8 bg-white text-black min-h-screen">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {/* Shareable Profile Link */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Your Profile Link</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            value={profileUrl}
            disabled
            className="flex-1 text-sm bg-gray-100 border-gray-300"
          />
          <Button onClick={copyToClipboard} variant="secondary" className="shrink-0 gap-2">
            <Copy className="h-4 w-4" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </section>

      {/* Toggle Accepting Messages */}
      <section className="flex items-center gap-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 border border-gray-400"
        />

        <span className="text-sm text-gray-600">
          Accepting Messages: <strong>{acceptMessages ? 'Enabled' : 'Disabled'}</strong>
        </span>
      </section>

      <Separator className="bg-gray-300" />

      {/* Refresh Button */}
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

      {/* Messages */}
      <section className="flex flex-wrap gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <MessageSkeletonCard key={index} />)
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={(messageId) =>
                setMessages((prev) => prev.filter((m) => m._id !== messageId))
              }
            />
          ))
        ) : (
          <p className="text-gray-600 text-center w-full">No messages yet.</p>
        )}
      </section>
    </div>
  )
}

export default Dashboard
