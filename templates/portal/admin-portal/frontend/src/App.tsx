import { Route, Routes } from 'react-router'
import HomePage from './pages/Dashboard/HomePage.tsx'
import ContactListPage from './pages/Contacts/ContactListPage'
import ContributionListPage from './pages/Contributions/ContributionListPage/index.tsx'
import NotFoundPage from './pages/NotFoundPage'
import MainLayout from './layouts/MainLayout'
import ContactDetailPage from './pages/Contacts/ContactDetailPage'
import ContributionDetailPage from './pages/Contributions/ContributionDetailPage/index.tsx'
import ReportListPage from "./pages/Reports/ReportListPage/index.tsx";
import ReportDetailPage from "./pages/Reports/ReportDetailPage/index.tsx";
import ActivityDetailPage from './pages/Activities/ActivityDetailPage/index.tsx'
import SearchkitDetailPage from "./pages/Reports/SearchkitDetailPage/index.tsx";
import IrasConfigurationPage from "./pages/Iras/IrasConfigurationPage/index.tsx"
import IrasOnlineReportPage from "./pages/Iras/IrasOnlineReportPage/index.tsx"

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path='contacts'>
          <Route index element={<ContactListPage />} />
          <Route path=':id' element={<ContactDetailPage />} />
        </Route>
        <Route path='contributions' >
          <Route index element={<ContributionListPage />} />
          <Route path=':id' element={<ContributionDetailPage />} />
        </Route>
        <Route path='reports'>
          <Route index element={<ReportListPage />} />
          <Route path=':id' element={<ReportDetailPage />} />
          <Route path='searchkit/:id' element={<SearchkitDetailPage />} />
        </Route>
        <Route path='activities' >
          <Route path=':id' element={<ActivityDetailPage />} />
        </Route>
        <Route path="iras">
          <Route path="configuration" element={<IrasConfigurationPage />} />
          <Route path="online-reports" element={<IrasOnlineReportPage />} />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}
