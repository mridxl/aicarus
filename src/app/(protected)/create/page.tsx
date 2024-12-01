"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();

  function onSubmit(data: FormInput) {
    window.alert(JSON.stringify(data, null, 2));
    return true;
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/undraw-hacker.svg" alt="Create" className="h-56 w-auto" />
      <div>
        <div className="text-2xl font-semibold">
          Link your Github repository
          <div className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to Aicarus
          </div>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              This will be the name of the project in Aicarus
            </span>
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="Github URL"
              type="url"
              required
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              Enter the URL of the repository you want to link
            </span>
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <span className="pl-[2px] text-xs text-muted-foreground">
              This is required for private repositories
            </span>
            <div className="h-2"></div>
            <Button type="submit">
              Create Project
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
