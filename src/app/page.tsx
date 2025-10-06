export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to SeeZee
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional services and solutions for your business needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Services</h3>
              <p className="text-gray-600">Explore our professional services</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Work</h3>
              <p className="text-gray-600">View our portfolio and case studies</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Contact</h3>
              <p className="text-gray-600">Get in touch with our team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}