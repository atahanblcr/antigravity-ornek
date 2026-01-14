"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // SSR ile uyumlu - sunucuda prefetch, istemcide refetch
                staleTime: 60 * 1000, // 1 dakika
                refetchOnWindowFocus: false,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (typeof window === "undefined") {
        // Sunucu: her zaman yeni client
        return makeQueryClient()
    } else {
        // Tarayıcı: singleton
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

/**
 * TanStack Query Provider
 * Reference.md Bölüm 7.2 - Sunucu durumu için TanStack Query
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
