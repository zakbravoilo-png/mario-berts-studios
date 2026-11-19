import { useEffect } from 'react'
import { Hero } from './home/Hero'
import { FactStrip } from './home/FactStrip'
import { ServicesSection } from './home/ServicesSection'
import { RoomsSection } from './home/RoomsSection'
import { RentalsSection } from './home/RentalsSection'
import { BookingSection } from './home/BookingSection'
import { LessonsSection } from './home/LessonsSection'
import { MoreSection } from './home/MoreSection'
import { FinalCta } from './home/FinalCta'

export function HomePage() {
  useEffect(() => {
    document.title = "Manoy Bart's Studio — Rehearsal rooms, lessons & streaming (prototype)"
  }, [])
  return (
    <>
      <Hero />
      <FactStrip />
      <ServicesSection />
      <RoomsSection />
      <RentalsSection />
      <BookingSection />
      <LessonsSection />
      <MoreSection />
      <FinalCta />
    </>
  )
}
