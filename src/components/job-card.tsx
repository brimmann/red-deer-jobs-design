"use client"

import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Job } from "@/lib/jobs"
import { cn } from "cn"

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="rounded-xl shadow-sm transition-shadow hover:border-primary/20 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-accent font-medium text-accent-foreground">
                {job.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{job.title}</CardTitle>
              <p className="truncate text-sm text-muted-foreground">
                {job.company}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <MapPin />
            Red Deer, AB
          </Badge>
          <Badge variant="outline">{job.type}</Badge>
          {job.urgent ? <Badge>Urgent Hire</Badge> : null}
          {job.remote ? <Badge variant="outline">Remote</Badge> : null}
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{job.salary}</p>
            <p className="text-sm text-muted-foreground">{job.posted}</p>
          </div>
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
            )}
          >
            View Job
            <ArrowUpRight />
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
