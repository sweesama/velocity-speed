import { AppLanguage } from '../types'

export interface ViralSpeedInsight {
  badge: string          // 社交身份称号
  rankTag: string        // 全球排位标签
  percentile: string     // 超越百分比
  headline: string       // 严格分行排版的社交金句 (通过 \n 手工控制语义断行，杜绝断词与孤字)
  subtext: string        // 严格分行排版的副文案
  progressRatio: number  // 0 ~ 1 参照进度条比例
}

/**
 * 跨文化原生社交传播引擎 + 手工级语义断行排版 (Semantic Line-Break Control)
 * 每一行严格控制在 11~17 个汉字以内，确保任何手机屏幕上绝不把一个词拆成两行，也绝不产生单字孤行
 */
export function getSpeedViralInsight(
  maxKmh: number,
  lang: AppLanguage = 'zh',
  variant: number = 0
): ViralSpeedInsight {
  const spd = Number.isFinite(maxKmh) && maxKmh >= 0 ? maxKmh : 0
  const v = Math.abs(variant) % 3

  // ==================== 欧美母语社交语境 (精准语义断行) ====================
  if (lang === 'en') {
    if (spd < 1) {
      const variants = [
        {
          badge: 'Mentally on PTO',
          rankTag: '0% MOTION · 100% UNBOTHERED',
          headline: 'Outpaced 0.0% of humanity today,\nand honestly? Good for me.',
          subtext: 'Physically at my desk, spiritually in Amalfi\nProtecting my peace at 0.0 mph'
        },
        {
          badge: 'Horizontal CEO',
          rankTag: 'DO NOT DISTURB ERA',
          headline: 'Zero steps taken on the ground,\nyet hurtling through space at 67,000 mph',
          subtext: 'Why run when the solar system\nis already doing the heavy lifting?'
        },
        {
          badge: 'Gridlock Survivor',
          rankTag: 'TRAFFIC MEDITATION',
          headline: 'Clocked a breathtaking 0.0 mph,\neven a strolling golden retriever passed me',
          subtext: 'This commute could have been an email\nPlaylists are keeping me sane'
        }
      ]
      return {
        ...variants[v],
        percentile: '0.0%',
        progressRatio: 0.06
      }
    }

    if (spd < 7) {
      const pct = (24 + (spd / 7) * 24).toFixed(1)
      const topPct = (100 - parseFloat(pct)).toFixed(1)
      const variants = [
        {
          badge: 'Iced Coffee Walk',
          headline: `Faster than ${pct}% of people\ndoomscrolling on the couch right now`,
          subtext: `Officially went outside and touched grass\nPowered by iced oat latte and sunshine`
        },
        {
          badge: 'Main Character Stroll',
          headline: `Moving life at 0.5× speed,\noutpaced ${pct}% of everyone indoors`,
          subtext: `No rush, no notifications\nJust romanticizing the golden hour walk`
        },
        {
          badge: 'Soft Life Pace',
          headline: `Outpaced ${pct}% of indoor humans,\nzero sweat and maximum vibes`,
          subtext: `Too fast to be standing still,\ntoo chill to be stressed about anything`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% OUTSIDE TODAY`,
        percentile: `${pct}%`,
        progressRatio: 0.18
      }
    }

    if (spd < 20) {
      const pct = (50 + ((spd - 7) / 13) * 22).toFixed(1)
      const topPct = (100 - parseFloat(pct)).toFixed(1)
      const variants = [
        {
          badge: 'Runner’s High Club',
          headline: `Faster than ${pct}% of people right now,\nand way cheaper than therapy`,
          subtext: `Heart rate in Zone 4, overthinking at 0%\nToday’s endorphins have officially arrived`
        },
        {
          badge: 'Cardio & Chaos',
          headline: `Outpaced ${pct}% of pedestrians today,\nrunning away from my responsibilities`,
          subtext: `Current pace: significantly faster\nthan my Monday morning motivation`
        },
        {
          badge: 'Street Velocity',
          headline: `Faster than ${pct}% of everyone on foot,\ncompletely owning the bike lane`,
          subtext: `Headphones at 80% volume\nCatching every green light downtown`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% ENDORPHIN RUSH`,
        percentile: `${pct}%`,
        progressRatio: 0.32
      }
    }

    if (spd < 50) {
      const pct = (73 + ((spd - 20) / 30) * 14).toFixed(1)
      const topPct = (100 - parseFloat(pct)).toFixed(1)
      const variants = [
        {
          badge: 'Aero Everything',
          headline: `Faster than ${pct}% of city commuters,\nleaving rush-hour traffic in shambles`,
          subtext: `While four-wheelers stare at brake lights,\nI’m already halfway home`
        },
        {
          badge: 'Full Send Mode',
          headline: `Outpaced ${pct}% of humans on the ground,\ngravity doing its best work downhill`,
          subtext: `Quads on fire, wind in the mic\nNothing beats two-wheel freedom`
        },
        {
          badge: 'Green Light Legend',
          headline: `Faster than ${pct}% of the city today,\nslicing through without touching brakes`,
          subtext: `Soundtrack hitting the beat drop\nat the exact right intersection`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% CITY PACE`,
        percentile: `${pct}%`,
        progressRatio: 0.48
      }
    }

    if (spd < 105) {
      const pct = (87 + ((spd - 50) / 55) * 7.2).toFixed(1)
      const topPct = (100 - parseFloat(pct)).toFixed(1)
      const variants = [
        {
          badge: 'Late Night Drive',
          headline: `Faster than ${pct}% of people today,\nwindows down with the 2 AM playlist`,
          subtext: `Highway lights blurring in the mirror\nOpen-road therapy is in session`
        },
        {
          badge: 'Out of Office',
          headline: `Outpaced ${pct}% of humans right now,\nleaving 9-to-5 drama in the mirror`,
          subtext: `City skyline shrinking behind me\nDo not call unless it’s an emergency`
        },
        {
          badge: 'Smooth Operator',
          headline: `Faster than ${pct}% of everyone on land,\ncruising effortlessly in the left lane`,
          subtext: `Zero turbulence, iced coffee intact\nJust pure nocturnal momentum`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% ON EARTH`,
        percentile: `${pct}%`,
        progressRatio: 0.62
      }
    }

    if (spd < 170) {
      const pct = (94.2 + ((spd - 105) / 65) * 3.8).toFixed(1)
      const topPct = (100 - parseFloat(pct)).toFixed(1)
      const variants = [
        {
          badge: 'Autobahn Energy',
          headline: `Faster than ${pct}% of humanity,\neven a sprinting cheetah is eating dust`,
          subtext: `Trading concrete noise for open horizons\nNext stop: mountains and ocean air`
        },
        {
          badge: 'Road Trip Era',
          headline: `Outpaced ${pct}% of creatures on land,\nheading somewhere without alarm clocks`,
          subtext: `300 miles of open interstate ahead\nand zero bad songs on the queue`
        },
        {
          badge: 'Grand Tourer',
          headline: `Faster than ${pct}% of the planet today,\nlocked into effortless cruise control`,
          subtext: `When the road stretches to the horizon,\neverything else fades into background noise`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% WORLDWIDE`,
        percentile: `${pct}%`,
        progressRatio: 0.76
      }
    }

    if (spd < 420) {
      const pct = (98.2 + ((spd - 170) / 250) * 1.4).toFixed(2)
      const topPct = (100 - parseFloat(pct)).toFixed(2)
      const variants = [
        {
          badge: 'Bullet Train Era',
          headline: `Faster than ${pct}% of humans today,\ntowns flash by while my coffee stays still`,
          subtext: `200 mph gliding on steel rails\nTurning a long trip into a daydream`
        },
        {
          badge: 'F1 Straight-Line Club',
          headline: `Outpaced ${pct}% of everyone on Earth,\nmatching Formula 1 peak speed in a seat`,
          subtext: `Fast enough for a jet to lift off,\nyet still cruising smoothly on land`
        },
        {
          badge: 'Time Traveler',
          headline: `Faster than ${pct}% of humanity right now,\nwatching scenery on 8× fast-forward`,
          subtext: `Blink once and you’re already\nin a completely different city`
        }
      ]
      return {
        ...variants[v],
        rankTag: `TOP ${topPct}% LAND APEX`,
        percentile: `${pct}%`,
        progressRatio: 0.89
      }
    }

    const pct = Math.min(99.99, 99.62 + ((spd - 420) / 600) * 0.36).toFixed(2)
    const topPct = Math.max(0.01, 100 - parseFloat(pct)).toFixed(2)
    const variants = [
      {
        badge: 'Catching Flights',
        headline: `Faster than ${pct}% of humanity,\nsipping ginger ale at 36,000 feet`,
        subtext: `-55°F and 550 mph outside the window\nGround problems look microscopic up here`
      },
      {
        badge: 'Window Seat CEO',
        headline: `Outpaced ${pct}% of humans & 95% of flights,\nchasing the sunset across time zones`,
        subtext: `Airplane Mode is officially on\nNobody on Earth can reach me right now`
      },
      {
        badge: 'Mach 0.82 Club',
        headline: `Faster than ${pct}% of everyone alive,\nhurtling through the stratosphere`,
        subtext: `Catching flights, not feelings\nTouching down into a brand new story`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% OF HUMANITY`,
      percentile: `${pct}%`,
      progressRatio: 0.98
    }
  }

  // ==================== 中文母语社交语境 (手工级语义断行，每行 11~16 字，绝不断词) ====================
  if (spd < 1) {
    const variants = [
      {
        badge: '带薪静止中',
        rankTag: '0% 速度 · 100% 定力',
        headline: '今天击败了全国 0.0% 的人\n但成功保住了 100% 的体力',
        subtext: '只要我不动，老板和 KPI 就看不见我\n肉体焊在工位，灵魂早已去度假'
      },
      {
        badge: '沙发焊死认证',
        rankTag: '反内卷满级人类',
        headline: '今日微信步数全靠在沙发上翻身\n已被楼下散步大爷甩开十条街',
        subtext: '地球自己会以 1670 km/h 狂飙自转\n为什么要我自己动？'
      },
      {
        badge: '精神状态遥遥领先',
        rankTag: '情绪稳定大师',
        headline: '测出了每小时 0 公里的推背感\n连路边溜达的泰迪都回头看了我三眼',
        subtext: '今日烦恼追赶速度：0.0 km/h\n宜发呆、宜喝冰美式、宜放过自己'
      }
    ]
    return {
      ...variants[v],
      percentile: '0.0%',
      progressRatio: 0.06
    }
  }

  if (spd < 7) {
    const pct = (24 + (spd / 7) * 24).toFixed(1)
    const topPct = (100 - parseFloat(pct)).toFixed(1)
    const variants = [
      {
        badge: '街溜子满级',
        headline: `今天速度超过了全球 ${pct}% 的人\n击败所有窝在家里刷手机的对手`,
        subtext: `这个配速刚刚好，既不会累得喘气\n又能精准闻到路边烧烤摊和奶茶香味`
      },
      {
        badge: '下班慢放模式',
        headline: `比早八上班时的脚步慢了一半\n但此刻的快乐指数直接翻了三倍`,
        subtext: `今天不赶地铁，也不看手机时间\n吹着晚风慢慢晃回家，才算活过来`
      },
      {
        badge: '公园大爷接班人',
        headline: `今日速度超越了全球 ${pct}% 的人\n正式步入无欲无求的提前养老配速`,
        subtext: `比树懒快一点，比外卖小哥慢十倍\n主打一个心态稳如泰山`
      }
    ]
    return {
      ...variants[v],
      rankTag: `全球前 ${topPct}% 行动派`,
      percentile: `${pct}%`,
      progressRatio: 0.18
    }
  }

  if (spd < 20) {
    const pct = (50 + ((spd - 7) / 13) * 22).toFixed(1)
    const topPct = (100 - parseFloat(pct)).toFixed(1)
    const variants = [
      {
        badge: '今晚多吃两口',
        headline: `今日速度超越了全球 ${pct}% 的路人\n刚喝的那杯冰奶茶算是彻底白喝了`,
        subtext: `只要我跑得够快，卡路里就追不上我\n今日份多巴胺已全额到账`
      },
      {
        badge: '共享单车车神',
        headline: `把共享单车蹬出了风火轮的气势\n今日速度超越了全球 ${pct}% 的路人`,
        subtext: `在晚高峰的车流里丝滑穿梭\n连路边晒太阳的橘猫都得看我的尾灯`
      },
      {
        badge: '去班味专科',
        headline: `今日速度超越了全球 ${pct}% 的人\n正在把一整天的班味吹散在晚风里`,
        subtext: `耳机音量调到 80%，屏蔽一切消息\n接下来的二十分钟，整条街归我管`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% 活力人类`,
      percentile: `${pct}%`,
      progressRatio: 0.32
    }
  }

  if (spd < 50) {
    const pct = (73 + ((spd - 20) / 30) * 14).toFixed(1)
    const topPct = (100 - parseFloat(pct)).toFixed(1)
    const variants = [
      {
        badge: '秋名山电驴王',
        headline: `今日速度超越了全球 ${pct}% 的通勤人\n红绿灯起步至今还没输过谁`,
        subtext: `堵在路上的豪车车主纷纷投来羡慕眼神\n两轮才是城市晚高峰的终极答案`
      },
      {
        badge: '追风显眼包',
        headline: `今日速度超越了全球 ${pct}% 的人\n到了这个速度，连风声都变得好听`,
        subtext: `大腿在燃烧，灵魂在起飞\n下坡吹风的那一下，爽过绝大多数道理`
      },
      {
        badge: '绿波带锦鲤',
        headline: `今日速度超越了全球 ${pct}% 的人\n把堵成猪肝红的晚高峰甩开八百米`,
        subtext: `一路绿灯畅通无阻，丝滑到底\n今日出门运势直接拉满：SSR 级`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% 破风玩家`,
      percentile: `${pct}%`,
      progressRatio: 0.48
    }
  }

  if (spd < 105) {
    const pct = (87 + ((spd - 50) / 55) * 7.2).toFixed(1)
    const topPct = (100 - parseFloat(pct)).toFixed(1)
    const variants = [
      {
        badge: '夜间兜风选手',
        headline: `今日速度超越了全球 ${pct}% 的人\n没有烦心事是一脚油门解决不了的`,
        subtext: `车窗摇下一半，车载音乐调大两格\n今晚不聊工作，只看路灯往后飞`
      },
      {
        badge: '城市出逃计划',
        headline: `今日速度超越了全球 ${pct}% 的人\n正在把周一到周五的琐事甩在身后`,
        subtext: `后视镜里的写字楼越来越小\n前方吹进来的全是自由的味道`
      },
      {
        badge: '黄金右脚认证',
        headline: `今日速度超越了全球 ${pct}% 的人类\n稳得连副驾的冰美式都没晃一下`,
        subtext: `比草原上狂奔的斑马还要快\n坐稳扶好，准备起飞`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% 全球速度`,
      percentile: `${pct}%`,
      progressRatio: 0.62
    }
  }

  if (spd < 170) {
    const pct = (94.2 + ((spd - 105) / 65) * 3.8).toFixed(1)
    const topPct = (100 - parseFloat(pct)).toFixed(1)
    const variants = [
      {
        badge: '高速巡航舰长',
        headline: `今日速度超越了全球 ${pct}% 的人\n连非洲草原的猎豹都吃不到你的尾气`,
        subtext: `服务区的烤肠也留不住我\n正在全速奔向山海、晚风和假期`
      },
      {
        badge: '地表疾驰玩家',
        headline: `今日速度超越了全球 ${pct}% 的人类\n风噪终于盖过了副驾的唠叨`,
        subtext: `定速巡航已开启，前方视野拉满\n下一站：去一个不用定闹钟的地方`
      },
      {
        badge: '旷野追风人',
        headline: `今日速度超越了全球 ${pct}% 的人\n油门踩下去的那一刻世界都清静了`,
        subtext: `在旷野的高速上拉出一条直线\n所有的好心情都在路上了`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% 全球人类`,
      percentile: `${pct}%`,
      progressRatio: 0.76
    }
  }

  if (spd < 420) {
    const pct = (98.2 + ((spd - 170) / 250) * 1.4).toFixed(2)
    const topPct = (100 - parseFloat(pct)).toFixed(2)
    const variants = [
      {
        badge: '陆地贴地飞行',
        headline: `今日速度超越了全球 ${pct}% 的人\n窗外一秒闪过一个村，咖啡纹丝不动`,
        subtext: `几百公里的距离，不过刷两集剧的时间\n基建狂魔的快乐就是这么朴实无华`
      },
      {
        badge: '复兴号试飞员',
        headline: `今日速度超越了全球 ${pct}% 的人类\n已超过民航客机跑道起飞速度`,
        subtext: `只要速度够快，距离就不再是借口\n下一站，去见想见的人`
      },
      {
        badge: 'F1 同款尾速',
        headline: `今日速度超越了全球 ${pct}% 的人\n瘫在座椅上体验了一把 F1 直道尾速`,
        subtext: `窗外风景开启 8 倍速快进模式\n眨个眼的功夫，已经换了一座城`
      }
    ]
    return {
      ...variants[v],
      rankTag: `TOP ${topPct}% 地表巅峰`,
      percentile: `${pct}%`,
      progressRatio: 0.89
    }
  }

  const pct = Math.min(99.99, 99.62 + ((spd - 420) / 600) * 0.36).toFixed(2)
  const topPct = Math.max(0.01, 100 - parseFloat(pct)).toFixed(2)
  const variants = [
    {
      badge: '万米高空VIP',
      headline: `今日速度超越了全球 ${pct}% 的人类\n正在一万米高空优雅地喝加冰可乐`,
      subtext: `窗外零下 50°C、时速近千公里\n地面的鸡毛蒜皮，在云层上连像素都不算`
    },
    {
      badge: '平流层追光者',
      headline: `今日速度超越了全球 ${pct}% 的人\n超越 95% 的航班，正在跟落日赛跑`,
      subtext: `脚下是翻涌的云海与山河\n最爽的是这几个小时全世界谁也找不到我`
    },
    {
      badge: '近音速巡航员',
      headline: `今日速度超越了全球 ${pct}% 的地球人\n正以接近子弹出膛的速度跨越山海`,
      subtext: `飞机舷窗是最好的取景框\n落地之后，又是热气腾腾的新生活`
    }
  ]
  return {
    ...variants[v],
    rankTag: `TOP ${topPct}% 人类巅峰`,
    percentile: `${pct}%`,
    progressRatio: 0.98
  }
}

export const messages = {
  zh: {
    previewMode: '预览视窗',
    iphoneMockup: 'iPhone 样机',
    immersiveFullscreen: '全屏沉浸',

    tabDashboard: '测速',
    tabReports: '证书',
    tabSettings: '设置',

    modeMinimal: '极简',
    modeGauge: '表盘',
    gpsLocked: '已定位',
    gpsWeak: '信号弱',
    gpsLocating: '定位中',
    gpsPrompt: '开启定位',
    gpsDenied: '未开启定位',
    gpsReady: '就绪',
    bannerNeedAuth: '需要定位权限以测量实时速度',
    btnAuthorize: '开启',
    bannerCabinTip: '机舱或车厢内，贴近窗户信号更佳',
    gForceLabel: '推背感',
    maxSpeedLabel: '最高速度',
    altitudeLabel: '海拔高度',
    distanceLabel: '累计里程',
    avgSpeedShort: '均速',
    peakGShort: '推背',
    durationShort: '用时',
    standbyStatus: '移动后自动计时',
    pausedStatus: '已暂停',
    scalePrefix: '量程',

    hudMirroredOn: '镜像投影开启',
    hudMirroredOff: '正向显示',
    hudThemeWhite: '光学白',
    hudThemeEmerald: '钛金属',
    hudThemeAmber: '香槟金',
    hudInstruction: '将手机平放于前挡风玻璃或舷窗下\n通过玻璃反射即可观看正向数字',

    reportsTitle: '速度证书',
    btnSavePoster: '保存',
    btnSharePoster: '分享',
    btnRendering: '...',
    btnShuffleQuote: '换词',
    styleDark: '曜石',
    styleGlass: '钛金',
    styleCyber: '暖砂',
    tagPlaceholder: '添加行程或航班备注...',
    btnBackToLive: '恢复实时',
    certHeaderSub: '实时速度记录',
    certPeakTitle: '今日最高速度',
    certPeakG: '峰值推背',
    certAvgSpeed: '平均速度',
    certMaxAlt: '最高海拔',
    certDistance: '累计里程',
    certDuration: '有效时长',
    posterGrowthTag: 'VELOCITY',
    historyTitle: '历史测速记录',
    btnClearHistory: '清空',

    settingsTitle: '设置',
    settingsSubtitle: '仪器偏好、专属权益与传感器诊断',
    secPreferences: '通用偏好',
    rowLanguage: '界面语言',
    rowSpeedUnit: '速度单位',
    rowAltUnit: '海拔单位',
    unitMeter: '米 m',
    unitFeet: '英尺 ft',
    rowWakeLock: '保持屏幕常亮',
    wakeLockDesc: '测速期间防止手机自动锁屏',
    rowHudMirror: 'HUD 默认镜像',
    hudMirrorDesc: '开启时自动水平翻转投影画面',
    rowHaptics: '轻触震动反馈',
    hapticsDesc: '切换单位与突破时速时轻微震动',

    secTelemetry: '传感器状态',
    rowSatStatus: '卫星定位',
    statusLocked: '信号良好',
    statusWeak: '信号偏弱',
    statusSearching: '正在定位',
    statusPrompt: '待授权',
    statusDenied: '未开启',
    statusUnavailable: '不可用',
    rowDopplerAcc: '测速误差范围',
    rowCepAcc: '定位精度',
    rowGeoAlt: '当前海拔',
    altWaitingSignal: '--',
    rowCoords: '当前坐标',
    rowHeading: '移动方向',
    headingWaiting: '--',
    rowImu: '推背感传感器',
    imuReady: '已激活',
    btnActivateImu: '点击激活',
    authHintBar: '尚未开启定位权限',
    btnViewBenefits: '如何开启',

    secPhysicsGuide: '多场景测速常见问题',
    guideAviationTitle: '飞机上开飞行模式能测速吗？',
    guideAviationDesc: '完全可以。卫星信号属于被动接收，\n开启飞行模式或无网络时依然可用。\n请将手机贴近客舱舷窗玻璃以获取信号。',
    guideGroundTitle: '高铁、驾车、骑行需要手动切换吗？',
    guideGroundDesc: '无需手动切换。系统会自动过滤静止漂移，\n并在检测到移动时自动开始计时。',
    guidePrivacyTitle: '位置数据会上传到服务器吗？',
    guidePrivacyDesc: '绝不上传。所有速度与海拔均在手机本地\n实时解算，100% 保护您的行程隐私。',
    btnResetSession: '清零当前测速记录',

    permTitleDenied: '需要开启定位权限',
    permTitleReady: '卫星定位已连接',
    permTitleDefault: '开启实时速度测量',
    permDescDenied: '需要读取手机定位芯片以计算移动速度\n当前浏览器或系统定位权限尚未开启',
    permDescReady: '已成功连接卫星信号\n所有速度与海拔均在手机本地实时计算',
    permDescDefault: '通过手机内置卫星芯片直接测算速度与海拔\n断网与飞行模式下均可正常使用',
    benefit1Title: '全场景真实速度',
    benefit1Desc: '涵盖步行、骑行、驾车、高铁与航班\n自动平滑测算每一刻的真实移动速度',
    benefit2Title: '真实海拔高度',
    benefit2Desc: '直接通过卫星几何测算真实海拔高度\n在增压客舱内也能显示万米高空读数',
    benefit3Title: '纯离线与隐私保护',
    benefit3Desc: '零服务器上传，不记录任何轨迹隐私\n所有计算均在您的手机本地完成',
    recoverTitle: '开启方法：',
    recoverStep1: '1. 手机：系统设置 › 隐私与安全性 › 定位服务 › 允许访问。',
    recoverStep2: '2. 浏览器：点击地址栏左侧图标，将「位置」设为允许。',
    btnPermDenied: '重新检测定位',
    btnPermReady: '刷新信号',
    btnPermDefault: '开启定位测速',
    btnPermDismissReady: '完成',
    btnPermDismissDefault: '暂不开启，先看看界面',

    toastResumed: '已开始记录',
    toastPaused: '已暂停记录',
    toastReset: '记录已归档并清零',
    toastHistoryDeleted: '已删除记录',
    toastHistoryCleared: '历史记录已清空',
    toastPosterSaved: '高清速度证书已保存',
    toastPosterShared: '已调起系统分享',
    toastPosterError: '保存失败，请重试',
    toastImuActivated: '推背感传感器已开启',
    toastImuUnavailable: '当前设备不支持运动传感器'
  },
  en: {
    previewMode: 'VIEWPORT',
    iphoneMockup: 'iPhone Frame',
    immersiveFullscreen: 'Full Screen',

    tabDashboard: 'Speed',
    tabReports: 'Card',
    tabSettings: 'Settings',

    modeMinimal: 'Minimal',
    modeGauge: 'Dial',
    gpsLocked: 'Locked',
    gpsWeak: 'Weak',
    gpsLocating: 'Locating',
    gpsPrompt: 'Enable GPS',
    gpsDenied: 'No Access',
    gpsReady: 'Ready',
    bannerNeedAuth: 'Location access required for live speed',
    btnAuthorize: 'Enable',
    bannerCabinTip: 'In a plane or train? Hold phone near window',
    gForceLabel: 'G-Force',
    maxSpeedLabel: 'Peak Speed',
    altitudeLabel: 'Altitude',
    distanceLabel: 'Distance',
    avgSpeedShort: 'Avg',
    peakGShort: 'Peak',
    durationShort: 'Time',
    standbyStatus: 'Auto-starts on move',
    pausedStatus: 'Paused',
    scalePrefix: 'Range',

    hudMirroredOn: 'Mirror On',
    hudMirroredOff: 'Direct View',
    hudThemeWhite: 'White',
    hudThemeEmerald: 'Titanium',
    hudThemeAmber: 'Champagne',
    hudInstruction: 'Place flat under windshield or cabin window\nto reflect upright numbers onto glass',

    reportsTitle: 'Speed Card',
    btnSavePoster: 'Save',
    btnSharePoster: 'Share',
    btnRendering: '...',
    btnShuffleQuote: 'Vibe',
    styleDark: 'Dark',
    styleGlass: 'Steel',
    styleCyber: 'Sand',
    tagPlaceholder: 'Add flight or route note...',
    btnBackToLive: 'Live',
    certHeaderSub: 'Live Speed Record',
    certPeakTitle: 'PEAK SPEED TODAY',
    certPeakG: 'Peak G',
    certAvgSpeed: 'Avg Speed',
    certMaxAlt: 'Max Alt',
    certDistance: 'Distance',
    certDuration: 'Duration',
    posterGrowthTag: 'VELOCITY',
    historyTitle: 'Recent Sessions',
    btnClearHistory: 'Clear',

    settingsTitle: 'Settings',
    settingsSubtitle: 'Preferences, Pro perks & sensor status',
    secPreferences: 'Preferences',
    rowLanguage: 'Language',
    rowSpeedUnit: 'Speed Unit',
    rowAltUnit: 'Altitude Unit',
    unitMeter: 'Meters m',
    unitFeet: 'Feet ft',
    rowWakeLock: 'Keep Screen Awake',
    wakeLockDesc: 'Prevent screen sleep while active',
    rowHudMirror: 'Default HUD Mirror',
    hudMirrorDesc: 'Flip HUD horizontally for glass',
    rowHaptics: 'Haptic Feedback',
    hapticsDesc: 'Subtle vibration on unit & speed ticks',

    secTelemetry: 'Sensor Status',
    rowSatStatus: 'Satellite Signal',
    statusLocked: 'Good Signal',
    statusWeak: 'Weak Signal',
    statusSearching: 'Locating',
    statusPrompt: 'Not Enabled',
    statusDenied: 'Denied',
    statusUnavailable: 'Unavailable',
    rowDopplerAcc: 'Speed Accuracy',
    rowCepAcc: 'Position Accuracy',
    rowGeoAlt: 'Current Altitude',
    altWaitingSignal: '--',
    rowCoords: 'Coordinates',
    rowHeading: 'Heading',
    headingWaiting: '--',
    rowImu: 'G-Force Sensor',
    imuReady: 'Active',
    btnActivateImu: 'Activate',
    authHintBar: 'Location access is off',
    btnViewBenefits: 'How to enable',

    secPhysicsGuide: 'Tips & FAQ',
    guideAviationTitle: 'Does it work in Airplane Mode?',
    guideAviationDesc: 'Yes. Satellite signals are received passively\noffline. Hold your phone close to the cabin\nwindow glass for optimal reception.',
    guideGroundTitle: 'Do I need to switch modes manually?',
    guideGroundDesc: 'No. Velocity filters stationary drift\nand starts timing automatically on move.',
    guidePrivacyTitle: 'Is my location data uploaded anywhere?',
    guidePrivacyDesc: 'Never. All speed and altitude calculations\nrun 100% locally on your device.',
    btnResetSession: 'Reset Current Session',

    permTitleDenied: 'Location Access Needed',
    permTitleReady: 'Satellite Signal Connected',
    permTitleDefault: 'Enable Live Speedometer',
    permDescDenied: 'Velocity needs location access to measure speed\nPlease enable it in browser or system settings',
    permDescReady: 'Connected to satellite signals\nAll calculations run locally on your device',
    permDescDefault: 'Measure live speed and altitude from satellites\nWorks offline and in Airplane Mode',
    benefit1Title: 'Universal Real-Time Speed',
    benefit1Desc: 'From walking and cycling to bullet trains\nand flights at 36,000 feet',
    benefit2Title: 'True Geometric Altitude',
    benefit2Desc: 'Measures true altitude above sea level,\nunaffected by pressurized cabins',
    benefit3Title: '100% Offline & Private',
    benefit3Desc: 'Zero servers, zero tracking.\nYour location never leaves your phone',
    recoverTitle: 'How to enable:',
    recoverStep1: '1. Mobile: Settings › Privacy › Location Services › Allow.',
    recoverStep2: '2. Browser: Click the address bar icon and allow Location.',
    btnPermDenied: 'Retry Connection',
    btnPermReady: 'Refresh Signal',
    btnPermDefault: 'Enable Location',
    btnPermDismissReady: 'Done',
    btnPermDismissDefault: 'Explore Interface First',

    toastResumed: 'Recording started',
    toastPaused: 'Recording paused',
    toastReset: 'Session archived and reset',
    toastHistoryDeleted: 'Session removed',
    toastHistoryCleared: 'History cleared',
    toastPosterSaved: 'Speed card image saved',
    toastPosterShared: 'Opened share sheet',
    toastPosterError: 'Could not save image',
    toastImuActivated: 'G-Force sensor active',
    toastImuUnavailable: 'Motion sensor unavailable'
  }
} as const

export function useI18n(lang: AppLanguage) {
  return messages[lang] || messages.zh
}
