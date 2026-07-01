import { Outlet } from 'react-router-dom'
import CitizenNavbar from './CitizenNavbar'

export default function CitizenLayout() {
  return (
    <>
      <CitizenNavbar />
      <Outlet />
    </>
  )
}
