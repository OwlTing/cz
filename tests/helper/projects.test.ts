import { describe, it, expect } from 'vitest'
import projects from '../../src/helper/projects'

describe('projects', () => {
  it('should export an array of projects', () => {
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })

  it('should have all required properties for each project', () => {
    projects.forEach(project => {
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('prefix')
      expect(project).toHaveProperty('value')

      expect(typeof project.name).toBe('string')
      expect(typeof project.prefix).toBe('string')
      expect(typeof project.value).toBe('string')
    })
  })

  it('should contain expected projects', () => {
    const expectedProjects = ['owlpay', 'owlnest', 'market', 'paynow', 'wallet-pro']
    const actualProjects = projects.map(project => project.value)

    expectedProjects.forEach(expectedProject => {
      expect(actualProjects).toContain(expectedProject)
    })
  })

  it('should have unique values', () => {
    const values = projects.map(project => project.value)
    const uniqueValues = [...new Set(values)]
    expect(values.length).toBe(uniqueValues.length)
  })

  it('should have unique prefixes', () => {
    const prefixes = projects.map(project => project.prefix)
    const uniquePrefixes = [...new Set(prefixes)]
    expect(prefixes.length).toBe(uniquePrefixes.length)
  })

  it('should have non-empty names and prefixes', () => {
    projects.forEach(project => {
      expect(project.name.trim()).not.toBe('')
      expect(project.prefix.trim()).not.toBe('')
      expect(project.value.trim()).not.toBe('')
    })
  })

  it('should have uppercase prefixes', () => {
    projects.forEach(project => {
      expect(project.prefix).toBe(project.prefix.toUpperCase())
    })
  })

  it('should have lowercase values', () => {
    projects.forEach(project => {
      expect(project.value).toBe(project.value.toLowerCase())
    })
  })
})
