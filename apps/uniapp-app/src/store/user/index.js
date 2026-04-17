import { defineStore } from 'pinia'
import { getUserInfo, postUserLogin } from '@/api/user/index.js'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref({})
    const userId = computed(() => userInfo.value.id || '')

    const token = ref('')

    async function login() {
      const res = await postUserLogin()

      token.value = res.token
    }

    function logout() {
      token.value = ''
    }

    async function getUserData() {
      const res = await getUserInfo()

      userInfo.value = res.data
    }

    return {
      token,
      userInfo,
      userId,
      login,
      logout,
      getUserData,
    }
  },
  {
    persist: {
      paths: ['token'],
    },
  },
)
