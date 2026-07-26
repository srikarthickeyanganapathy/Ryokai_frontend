import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getFilesRecursively(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList)
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath)
    }
  })
  return fileList
}

describe('FSD Workspace Boundary Enforcement & Cross-Workspace Smoke Test', () => {
  const srcDir = path.resolve(__dirname, '..')

  it('AC-6: Personal workspace features must never import Crew, Organization, or Admin features', () => {
    const personalDirs = [
      path.join(srcDir, 'features', 'personal'),
      path.join(srcDir, 'features', 'notes'),
      path.join(srcDir, 'features', 'focus'),
      path.join(srcDir, 'features', 'calendar'),
      path.join(srcDir, 'features', 'saved'),
    ]

    const forbiddenPatterns = [
      '@/features/crew',
      '@/features/crews',
      '@/features/whiteboards',
      '@/features/projects',
      '@/features/organization',
      '@/features/organizations',
      '@/features/workload',
      '@/features/goals',
      '@/features/admin',
    ]

    personalDirs.forEach((dir) => {
      const files = getFilesRecursively(dir)
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8')
        forbiddenPatterns.forEach((pattern) => {
          const hasViolation = content.includes(pattern)
          expect(hasViolation, `Boundary violation in ${file}: imports forbidden pattern "${pattern}"`).toBe(false)
        })
      })
    })
  })

  it('AC-6: Crew workspace features must never import Personal, Organization, or Admin features', () => {
    const crewDirs = [
      path.join(srcDir, 'features', 'crew'),
      path.join(srcDir, 'features', 'crews'),
      path.join(srcDir, 'features', 'whiteboards'),
      path.join(srcDir, 'features', 'projects'),
    ]

    const forbiddenPatterns = [
      '@/features/personal',
      '@/features/notes',
      '@/features/focus',
      '@/features/calendar',
      '@/features/saved',
      '@/features/organization',
      '@/features/organizations',
      '@/features/workload',
      '@/features/goals',
      '@/features/admin',
    ]

    crewDirs.forEach((dir) => {
      const files = getFilesRecursively(dir)
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8')
        forbiddenPatterns.forEach((pattern) => {
          const hasViolation = content.includes(pattern)
          expect(hasViolation, `Boundary violation in ${file}: imports forbidden pattern "${pattern}"`).toBe(false)
        })
      })
    })
  })

  it('AC-6: Organization workspace features must never import Personal, Crew, or Admin features', () => {
    const orgDirs = [
      path.join(srcDir, 'features', 'organization'),
      path.join(srcDir, 'features', 'organizations'),
      path.join(srcDir, 'features', 'workload'),
      path.join(srcDir, 'features', 'goals'),
    ]

    const forbiddenPatterns = [
      '@/features/personal',
      '@/features/notes',
      '@/features/focus',
      '@/features/calendar',
      '@/features/saved',
      '@/features/crew',
      '@/features/crews',
      '@/features/whiteboards',
      '@/features/projects',
      '@/features/admin',
    ]

    orgDirs.forEach((dir) => {
      const files = getFilesRecursively(dir)
      files.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8')
        forbiddenPatterns.forEach((pattern) => {
          const hasViolation = content.includes(pattern)
          expect(hasViolation, `Boundary violation in ${file}: imports forbidden pattern "${pattern}"`).toBe(false)
        })
      })
    })
  })

  it('AC-7 & Admin Boundary: Admin feature must only import entities/ and shared/ (never task/ or other features)', () => {
    const adminDir = path.join(srcDir, 'features', 'admin')
    const files = getFilesRecursively(adminDir)

    const forbiddenPatterns = [
      '@/features/task',
      '@/features/tasks',
      '@/features/personal',
      '@/features/crew',
      '@/features/organization',
    ]

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8')
      forbiddenPatterns.forEach((pattern) => {
        const hasViolation = content.includes(pattern)
        expect(hasViolation, `Admin boundary violation in ${file}: imports forbidden pattern "${pattern}"`).toBe(false)
      })
    })
  })
})
