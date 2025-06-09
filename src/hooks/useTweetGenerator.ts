'use client'
import { useMemo } from 'react'
import { ONG } from '@/types/ong'

interface TweetOptions {
  selectedNumbers: string
  winningNumbers: string
  isWinner: boolean
  selectedONG: ONG
}

export function useTweetGenerator({ selectedNumbers, winningNumbers, isWinner, selectedONG }: TweetOptions) {
  const winningTweets = [
    `🎰🎉 ¡GANÉ EN SUPER LOTERÍA NEÓN! 🎉

Número ganador: ${selectedNumbers} ✨
${selectedONG.icon} 15% de mi jugada va para ${selectedONG.name}

¡GANAR Y AYUDAR SE SIENTE INCREÍBLE! 💫
#LoteríaNeón #${selectedONG.name.replace(/\s+/g, '')} #JuegoSolidario`,

    `🚨 ¡JACKPOT SOLIDARIO! 🚨

✅ Acerté: ${selectedNumbers}
💝 Mi premio ayuda a ${selectedONG.name} ${selectedONG.icon}

Cada victoria cuenta para una buena causa 🌟
#LoteríaNeón #SolidaridadDigital`,

    `💥 ¡BOOM! Número mágico: ${selectedNumbers} 💥

🎯 Gané Y ayudé a ${selectedONG.name} ${selectedONG.icon}
15% de cada jugada va directo a ONGs

¡La lotería más solidaria! 🤝
#LoteríaNeón #JuegoConPropósito`,

    `🎰 ¡VICTORIA DOBLE! 🎰

🏆 Gané con: ${selectedNumbers}
❤️ Contribuí a ${selectedONG.name} ${selectedONG.icon}

¡Jugar nunca se sintió tan bien! 🔥
#LoteríaNeón #GanarAyudando`
  ]

  const losingTweets = [
    `🎲 No gané, ¡pero SÍ ayudé! 💪

Mi número: ${selectedNumbers} | Ganador: ${winningNumbers}
${selectedONG.icon} 15% fue para ${selectedONG.name}

¡Perder nunca se sintió tan bien! 🤗
#LoteríaNeón #SiempreGanas`,

    `🎯 ${selectedNumbers} vs ${winningNumbers} 🎯

No acerté, pero mi jugada apoya a ${selectedONG.name} ${selectedONG.icon}
¡CADA INTENTO CUENTA! 🌟

#LoteríaNeón #JuegoSolidario #${selectedONG.name.replace(/\s+/g, '')}`,

    `🎰 Casi gano con ${selectedNumbers}! 🎰

Pero lo genial: ayudé a ${selectedONG.name} ${selectedONG.icon}
15% de cada jugada = impacto real 💝

¡Voy por el siguiente! 🚀
#LoteríaNeón #CadaJugadaCuenta`,

    `🎲 ${selectedNumbers} no salió, ¡pero mi corazón está lleno! ❤️

Mi jugada contribuyó a ${selectedONG.name} ${selectedONG.icon}
¡En esta lotería TODOS ganamos! 🤝

#LoteríaNeón #JugarConCorazón`
  ]

  const selectedTweet = useMemo(() => {
    const tweets = isWinner ? winningTweets : losingTweets
    return tweets[Math.floor(Math.random() * tweets.length)]
  }, [selectedNumbers, winningNumbers, isWinner, selectedONG.id])

  return selectedTweet
}