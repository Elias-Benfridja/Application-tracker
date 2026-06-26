import { useCallback, useEffect, useState } from 'react'
import api from '../api/axios'

export const FREE_TIER_APP_LIMIT = 1

interface ProfileData {
  isPro: boolean
  appCount: number
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/user/me/')
      setProfile({
        isPro: response.data.profile.is_pro,
        appCount: response.data.profile.app_count,
      })
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const upgrade = useCallback(async () => {
    setUpgrading(true)
    try {
      const response = await api.patch('/user/upgrade/')
      setProfile((prev) => ({
        isPro: response.data.is_pro,
        appCount: response.data.app_count ?? prev?.appCount ?? 0,
      }))
      return true
    } catch {
      return false
    } finally {
      setUpgrading(false)
    }
  }, [])

  const atFreeLimit =
    !!profile && !profile.isPro && profile.appCount >= FREE_TIER_APP_LIMIT

  return { profile, loading, upgrading, atFreeLimit, fetchProfile, upgrade }
}
