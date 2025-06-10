import { describe, it, expect } from 'vitest'
import commitTypes from '../../src/helper/commit-types'

describe('commit-types', () => {
  it('should export an array of commit types', () => {
    expect(Array.isArray(commitTypes)).toBe(true)
    expect(commitTypes.length).toBeGreaterThan(0)
  })

  it('should have all required properties for each commit type', () => {
    commitTypes.forEach(type => {
      expect(type).toHaveProperty('name')
      expect(type).toHaveProperty('emoji')
      expect(type).toHaveProperty('description')
      expect(type).toHaveProperty('value')

      expect(typeof type.name).toBe('string')
      expect(typeof type.emoji).toBe('string')
      expect(typeof type.description).toBe('string')
      expect(typeof type.value).toBe('string')
    })
  })

  it('should contain expected commit types', () => {
    const expectedTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'hotfix', 'release', 'storybook', 'revert']
    const actualTypes = commitTypes.map(type => type.value)

    expectedTypes.forEach(expectedType => {
      expect(actualTypes).toContain(expectedType)
    })
  })

  it('should have unique values', () => {
    const values = commitTypes.map(type => type.value)
    const uniqueValues = [...new Set(values)]
    expect(values.length).toBe(uniqueValues.length)
  })

  it('should have non-empty descriptions', () => {
    commitTypes.forEach(type => {
      expect(type.description.trim()).not.toBe('')
    })
  })

  it('should have emoji characters', () => {
    commitTypes.forEach(type => {
      expect(type.emoji).toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)
    })
  })
})
