import { createBrowserRouter } from 'react-router'
import { PublicLayout } from './layouts/PublicLayout'
import { RouteError } from './RouteError'
import { PortalLayout } from './layouts/PortalLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ServicesPage } from '../pages/public/ServicesPage'
import { RehearsalPage } from '../pages/public/RehearsalPage'
import { LessonsPage } from '../pages/public/LessonsPage'
import { StreamingPage } from '../pages/public/StreamingPage'
import { RoomsPage } from '../pages/public/RoomsPage'
import { RatesPage } from '../pages/public/RatesPage'
import { ShopPage } from '../pages/public/ShopPage'
import { AboutPage } from '../pages/public/AboutPage'
import { PrivacyPage } from '../pages/public/PrivacyPage'
import { DesignDraftsPage } from '../pages/public/DesignDraftsPage'
import { ContactPage } from '../pages/public/ContactPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'design-drafts', element: <DesignDraftsPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/rehearsal', element: <RehearsalPage /> },
      { path: 'services/lessons', element: <LessonsPage /> },
      { path: 'services/live-streaming', element: <StreamingPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rates', element: <RatesPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'book', lazy: async () => ({ Component: (await import('../pages/public/GuestBookingPages')).GuestRehearsalPage }) },
      { path: 'book/lesson', lazy: async () => ({ Component: (await import('../pages/public/GuestBookingPages')).GuestLessonPage }) },
      { path: 'book/streaming', lazy: async () => ({ Component: (await import('../pages/public/GuestBookingPages')).GuestStreamingPage }) },
      { path: 'login', lazy: async () => ({ Component: (await import('../pages/public/CustomerLoginPage')).CustomerLoginPage }) },
      { path: 'book/shop', lazy: async () => ({ Component: (await import('../pages/public/GuestBookingPages')).GuestShopPage }) },
      { path: 'my-booking', lazy: async () => ({ Component: (await import('../pages/public/FindBookingPage')).FindBookingPage }) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'portal',
    element: <PortalLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../pages/portal/PortalDashboard')).PortalDashboard }) },
      { path: 'book/rehearsal', lazy: async () => ({ Component: (await import('../features/booking/RehearsalBookingFlow')).RehearsalBookingFlow }) },
      { path: 'book/lesson', lazy: async () => ({ Component: (await import('../features/lessons/LessonBookingFlow')).LessonBookingFlow }) },
      { path: 'live-streaming', lazy: async () => ({ Component: (await import('../features/streaming/StreamingInquiryPage')).StreamingInquiryPage }) },
      { path: 'reservations', lazy: async () => ({ Component: (await import('../pages/portal/ReservationsPage')).ReservationsPage }) },
      { path: 'reservations/:ref', lazy: async () => ({ Component: (await import('../pages/portal/ReservationDetailPage')).ReservationDetailPage }) },
      { path: 'orders', lazy: async () => ({ Component: (await import('../pages/portal/OrdersPage')).OrdersPage }) },
      { path: 'profile', lazy: async () => ({ Component: (await import('../pages/portal/ProfilePage')).ProfilePage }) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: 'admin/login', errorElement: <RouteError />, lazy: async () => ({ Component: (await import('../pages/admin/AdminLoginPage')).AdminLoginPage }) },
  {
    path: 'admin',
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('../pages/admin/AdminOverview')).AdminOverview }) },
      { path: 'book', lazy: async () => ({ Component: (await import('../pages/admin/AdminBookPage')).AdminBookPage }) },
      { path: 'bookings', lazy: async () => ({ Component: (await import('../pages/admin/AdminBookings')).AdminBookings }) },
      { path: 'bookings/:ref', lazy: async () => ({ Component: (await import('../pages/admin/AdminBookingDetail')).AdminBookingDetail }) },
      { path: 'rooms', lazy: async () => ({ Component: (await import('../pages/admin/AdminRooms')).AdminRooms }) },
      { path: 'inventory', lazy: async () => ({ Component: (await import('../pages/admin/AdminInventory')).AdminInventory }) },
      { path: 'lessons', lazy: async () => ({ Component: (await import('../pages/admin/AdminLessons')).AdminLessons }) },
      { path: 'instructors', lazy: async () => ({ Component: (await import('../pages/admin/AdminInstructors')).AdminInstructors }) },
      { path: 'streaming', lazy: async () => ({ Component: (await import('../pages/admin/AdminStreaming')).AdminStreaming }) },
      { path: 'products', lazy: async () => ({ Component: (await import('../pages/admin/AdminProducts')).AdminProducts }) },
      { path: 'messages', lazy: async () => ({ Component: (await import('../pages/admin/AdminMessages')).AdminMessages }) },
      { path: 'settings', lazy: async () => ({ Component: (await import('../pages/admin/AdminSettings')).AdminSettings }) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
