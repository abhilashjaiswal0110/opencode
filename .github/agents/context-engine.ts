#!/usr/bin/env bun

import { getMemoryStore } from "./memory"
import path from "path"
import { glob } from "glob"

export interface ContextData {
  project: ProjectContext
  files: FileContext[]
  history: HistoryContext[]
  memory: MemoryContext
}

export interface ProjectContext {
  name: string
  path: string
  type: string
  technologies: string[]
  structure: string
  readme?: string
}

export interface FileContext {
  path: string
  type: string
  content?: string
  summary?: string
  lastModified: number
}

export interface HistoryContext {
  timestamp: number
  action: string
  files: string[]
  summary: string
}

export interface MemoryContext {
  recentFindings: any[]
  preferences: Record<string, any>
  patterns: string[]
}

export class ContextEngine {
  private agentName: string
  private sessionId: string | null = null
  private basePath: string
  private maxContextSize: number
  
  constructor(agentName: string, basePath: string, maxContextSize = 128000) {
    this.agentName = agentName
    this.basePath = basePath
    this.maxContextSize = maxContextSize
  }
  
  async initializeSession(): Promise<string> {
    const store = await getMemoryStore(this.basePath)
    this.sessionId = await store.createSession(this.agentName, {
      basePath: this.basePath,
      startTime: Date.now(),
    })
    return this.sessionId
  }
  
  async loadContext(): Promise<ContextData> {
    const [project, files, history, memory] = await Promise.all([
      this.loadProjectContext(),
      this.loadFileContext(),
      this.loadHistoryContext(),
      this.loadMemoryContext(),
    ])
    
    return {
      project,
      files,
      history,
      memory,
    }
  }
  
  private async loadProjectContext(): Promise<ProjectContext> {
    const packageJsonPath = path.join(this.basePath, "package.json")
    
    let packageJson: any = {}
    const packageFile = Bun.file(packageJsonPath)
    if (await packageFile.exists()) {
      packageJson = await packageFile.json()
    }
    
    // Detect technologies
    const technologies = this.detectTechnologies(packageJson)
    
    // Get project structure
    const structure = await this.getProjectStructure()
    
    // Try to load README
    let readme: string | undefined
    const readmePath = path.join(this.basePath, "README.md")
    const readmeFile = Bun.file(readmePath)
    if (await readmeFile.exists()) {
      readme = await readmeFile.text()
      // Truncate if too long
      if (readme.length > 5000) {
        readme = readme.substring(0, 5000) + "...\n[README truncated]"
      }
    }
    
    return {
      name: packageJson.name || path.basename(this.basePath),
      path: this.basePath,
      type: packageJson.type || "module",
      technologies,
      structure,
      readme,
    }
  }
  
  private detectTechnologies(packageJson: any): string[] {
    const technologies: string[] = []
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }
    
    if (deps) {
      if (deps.react || deps["solid-js"]) technologies.push("Frontend Framework")
      if (deps.typescript) technologies.push("TypeScript")
      if (deps.hono || deps.express) technologies.push("Backend Framework")
      if (deps["drizzle-orm"]) technologies.push("Database ORM")
      if (deps.bun) technologies.push("Bun Runtime")
    }
    
    return technologies
  }
  
  private async getProjectStructure(): Promise<string> {
    const structure: string[] = []
    const dirs = ["src", "packages", "lib", "app", "components"]
    
    for (const dir of dirs) {
      const dirPath = path.join(this.basePath, dir)
      const dirFile = Bun.file(dirPath)
      
      const proc = Bun.spawn(["find", dirPath, "-type", "d", "-maxdepth", "2"], {
        cwd: this.basePath,
        stdout: "pipe",
        stderr: "pipe",
      })
      
      const output = await new Response(proc.stdout).text()
      if (output) {
        structure.push(`${dir}/`)
        const subDirs = output.split("\n").filter(Boolean).slice(1)
        subDirs.forEach((d) => {
          structure.push(`  ${path.relative(this.basePath, d)}`)
        })
      }
    }
    
    return structure.join("\n")
  }
  
  private async loadFileContext(): Promise<FileContext[]> {
    const files: FileContext[] = []
    
    // Get recently modified files
    const proc = Bun.spawn(
      ["git", "diff", "--name-only", "HEAD~10..HEAD"],
      {
        cwd: this.basePath,
        stdout: "pipe",
        stderr: "pipe",
      }
    )
    
    const output = await new Response(proc.stdout).text()
    const recentFiles = output.split("\n").filter(Boolean).slice(0, 20)
    
    for (const filePath of recentFiles) {
      const fullPath = path.join(this.basePath, filePath)
      const file = Bun.file(fullPath)
      
      if (await file.exists()) {
        const stat = await Bun.file(fullPath).stat()
        files.push({
          path: filePath,
          type: path.extname(filePath),
          lastModified: stat.mtime.getTime(),
        })
      }
    }
    
    return files
  }
  
  private async loadHistoryContext(): Promise<HistoryContext[]> {
    const store = await getMemoryStore(this.basePath)
    const history = await store.retrieve(this.agentName, "session_history")
    return history || []
  }
  
  private async loadMemoryContext(): Promise<MemoryContext> {
    const store = await getMemoryStore(this.basePath)
    
    const [recentFindings, preferences, patterns] = await Promise.all([
      store.retrieve(this.agentName, "recent_findings"),
      store.retrieve(this.agentName, "preferences"),
      store.retrieve(this.agentName, "patterns"),
    ])
    
    return {
      recentFindings: recentFindings || [],
      preferences: preferences || {},
      patterns: patterns || [],
    }
  }
  
  async saveContext(key: string, data: any, ttl?: number): Promise<void> {
    if (!this.sessionId) {
      await this.initializeSession()
    }
    
    const store = await getMemoryStore(this.basePath)
    await store.store(this.agentName, this.sessionId!, key, data, ttl)
  }
  
  async updateMemory(key: string, value: any): Promise<void> {
    await this.saveContext(key, value, 604800) // 7 days TTL
  }
  
  async formatContextForPrompt(context: ContextData): Promise<string> {
    const sections: string[] = []
    
    // Project information
    sections.push("# Project Context")
    sections.push(`Project: ${context.project.name}`)
    sections.push(`Type: ${context.project.type}`)
    sections.push(`Technologies: ${context.project.technologies.join(", ")}`)
    sections.push("")
    
    if (context.project.readme) {
      sections.push("## README Summary")
      sections.push(context.project.readme.split("\n").slice(0, 20).join("\n"))
      sections.push("")
    }
    
    sections.push("## Project Structure")
    sections.push(context.project.structure)
    sections.push("")
    
    // Recent files
    if (context.files.length > 0) {
      sections.push("## Recently Modified Files")
      context.files.forEach((file) => {
        sections.push(`- ${file.path}`)
      })
      sections.push("")
    }
    
    // Memory context
    if (context.memory.recentFindings.length > 0) {
      sections.push("## Recent Findings")
      context.memory.recentFindings.forEach((finding) => {
        sections.push(`- ${finding}`)
      })
      sections.push("")
    }
    
    const formatted = sections.join("\n")
    
    // Truncate if too large
    if (formatted.length > this.maxContextSize) {
      return formatted.substring(0, this.maxContextSize) + "\n[Context truncated]"
    }
    
    return formatted
  }
  
  async endSession(): Promise<void> {
    if (this.sessionId) {
      const store = await getMemoryStore(this.basePath)
      await store.endSession(this.sessionId)
      this.sessionId = null
    }
  }
}

export async function createContextEngine(
  agentName: string,
  basePath: string
): Promise<ContextEngine> {
  const engine = new ContextEngine(agentName, basePath)
  await engine.initializeSession()
  return engine
}
