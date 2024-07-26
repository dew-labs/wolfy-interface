import {Button} from '@nextui-org/react'
import {useTranslation} from 'react-i18next'

import SkipLink from '@/components/SkipLink'
import HeadTags from '@/lib/head/HeadTags'
import skipTargetProps from '@/utils/a11y/skipTargetProps'

import style from './Home.module.scss'

export default function Home() {
  const {t} = useTranslation()
  return (
    <div className={style.Page}>
      <HeadTags title='Home' />
      <SkipLink title='Skip to main content' to='#main-content' />
      <main {...skipTargetProps('main-content')}>
        {t('welcome')}
        <input />
        <br />
        <button id='hehe'>hehe</button>
        <br />
        <a
          href='#hehe'
          style={{
            fontSize: 100,
          }}
        >
          link
        </a>
        <Button color='primary'>Button</Button>
        <textarea />
      </main>
    </div>
  )
}
