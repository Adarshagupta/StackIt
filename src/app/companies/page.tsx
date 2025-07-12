import MainLayout from '@/components/layouts/MainLayout'
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string
  industry: string
  location: string
  employees: string
  website: string
  logo: string
  openPositions: number
}

export default function CompaniesPage() {
  const companies: Company[] = [
    {
      id: '1',
      name: 'TechCorp',
      description: 'Leading technology company focused on AI and machine learning solutions.',
      industry: 'Technology',
      location: 'San Francisco, CA',
      employees: '1,000-5,000',
      website: 'https://techcorp.com',
      logo: 'TC',
      openPositions: 12
    },
    {
      id: '2',
      name: 'DevSolutions',
      description: 'Full-stack development agency specializing in React and Node.js applications.',
      industry: 'Software Development',
      location: 'New York, NY',
      employees: '50-200',
      website: 'https://devsolutions.com',
      logo: 'DS',
      openPositions: 8
    },
    {
      id: '3',
      name: 'CloudFirst',
      description: 'Cloud infrastructure and DevOps consulting for modern businesses.',
      industry: 'Cloud Services',
      location: 'Austin, TX',
      employees: '200-500',
      website: 'https://cloudfirst.com',
      logo: 'CF',
      openPositions: 15
    },
    {
      id: '4',
      name: 'DataWorks',
      description: 'Big data analytics and business intelligence solutions.',
      industry: 'Data Analytics',
      location: 'Seattle, WA',
      employees: '500-1,000',
      website: 'https://dataworks.com',
      logo: 'DW',
      openPositions: 6
    },
    {
      id: '5',
      name: 'MobileFirst',
      description: 'Mobile app development for iOS and Android platforms.',
      industry: 'Mobile Development',
      location: 'Los Angeles, CA',
      employees: '100-250',
      website: 'https://mobilefirst.com',
      logo: 'MF',
      openPositions: 10
    },
    {
      id: '6',
      name: 'SecureNet',
      description: 'Cybersecurity solutions and penetration testing services.',
      industry: 'Cybersecurity',
      location: 'Boston, MA',
      employees: '250-500',
      website: 'https://securenet.com',
      logo: 'SN',
      openPositions: 7
    }
  ]

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Companies</h1>
          <p className="text-gray-400">
            Discover innovative companies in our network and explore career opportunities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{companies.length}</p>
                <p className="text-gray-400">Partner Companies</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {companies.reduce((sum, company) => sum + company.openPositions, 0)}
                </p>
                <p className="text-gray-400">Open Positions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {new Set(companies.map(c => c.location.split(',')[1]?.trim())).size}
                </p>
                <p className="text-gray-400">Cities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {company.logo}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white">{company.name}</h3>
                    <p className="text-gray-400 text-sm">{company.industry}</p>
                  </div>
                </div>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                {company.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {company.location}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  {company.employees} employees
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Building2 className="h-4 w-4 mr-2" />
                  {company.openPositions} open positions
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
                    {company.industry}
                  </span>
                  <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">
                    Hiring
                  </span>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View Jobs →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want to list your company?
          </h2>
          <p className="text-blue-100 mb-6">
            Join our network of innovative companies and connect with top talent.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </MainLayout>
  )
} 