import { useState } from 'react'

const initialState = {
  name: '',
  phone: '',
  email: '',
  cabNumber: '',
  auditDate: '',
  auditName: '',
  location: '',
  latitude: '',
  longitude: '',
  toolKit: '',
  stephny: '',
  onboardCharger: '',
  carInterior: '',
  physicalAuditPass: ''
}

const interiorOptions = ['Good', 'OK', 'Bad - Not usable']
const auditPassOptions = ['Good - Yes', 'OK - Yes', 'No - Accidental', 'No - Breakdown']

function App() {
  const [formData, setFormData] = useState(initialState)
  const [status, setStatus] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
    })
}

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by this browser.')
      return
    }

    setStatus('Fetching location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setStatus('Location captured successfully.')
      },
      (error) => {
        console.error('Error getting location:', error)
        setStatus('Unable to capture location. Please allow location access.')
      }
    )
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!formData.latitude || !formData.longitude) {
    setStatus('Geolocation is mandatory.')
    return
  }

  setStatus('Submitting form...')

  const scriptURL = 'https://script.google.com/macros/s/AKfycbzfAcewSBh2M89odBvLAEKIal7-RyKKB_cIXYJI1dDJWJLef3lGB6mO849s7ycNvCqIKg/exec'

  try {
    const payload = { ...formData }

    const fileInputs = [
      'frontBumper',
      'leftSidePhoto',
      'rightSidePhoto',
      'rearBumper',
      'fitnessCertificate'
    ]

    for (let field of fileInputs) {
      const files = e.target[field].files
      payload[field] = []

      for (let i = 0; i < files.length; i++) {
        const base64 = await convertToBase64(files[i])
        payload[field].push(base64)
      }
    }

    const response = await fetch(scriptURL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const result = await response.text()
    console.log('Script response:', result)

    if (result.trim() === 'Success') {
      setStatus('Form submitted successfully.')
      setFormData(initialState)
      e.target.reset()
    } else {
      setStatus('Submission failed: ' + result)
    }

  } catch (error) {
    console.error(error)
    setStatus('Submission failed.')
  }
}
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70 sm:p-10">
        <div className="mb-10 text-center">
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-sky-600">Cab Audit Data</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Ampvolts Mumbai Pune</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Cab Audit Form for Mumbai and Pune location</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="space-y-3">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone <span className="text-red-500">*</span></label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              <label htmlFor="cabNumber" className="block text-sm font-medium text-slate-700">Cab Number <span className="text-red-500">*</span></label>
              <input type="text" id="cabNumber" name="cabNumber" value={formData.cabNumber} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="space-y-3">
              <label htmlFor="auditDate" className="block text-sm font-medium text-slate-700">Audit Date <span className="text-red-500">*</span></label>
              <input type="date" id="auditDate" name="auditDate" value={formData.auditDate} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="space-y-3">
              <label htmlFor="auditName" className="block text-sm font-medium text-slate-700">Audit Name <span className="text-red-500">*</span></label>
              <input type="text" id="auditName" name="auditName" value={formData.auditName} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location <span className="text-red-500">*</span></label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter location or use geolocation" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Geolocation <span className="text-red-500">*</span></p>
              <button type="button" onClick={getLocation} className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50">Capture Geolocation</button>
            </div>
            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Latitude:</span> <span className={formData.latitude ? 'text-green-600 font-semibold' : ''}>{formData.latitude || '–'}</span></p>
              <p><span className="font-semibold text-slate-900">Longitude:</span> <span className={formData.longitude ? 'text-green-600 font-semibold' : ''}>{formData.longitude || '–'}</span></p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { id: 'frontBumper', label: 'Car Front Bumper <span className="text-red-500">*</span>' },
              { id: 'leftSidePhoto', label: 'Car Left Side Photo <span className="text-red-500">*</span>' },
              { id: 'rightSidePhoto', label: 'Car Right Side Photo <span className="text-red-500">*</span>' },
              { id: 'rearBumper', label: 'Car Rear Bumper <span className="text-red-500">*</span>' },
              { id: 'fitnessCertificate', label: 'Fitness Certificate <span className="text-red-500">*</span>' }
            ].map((item) => (
              <div key={item.id} className="space-y-3">
                <label htmlFor={item.id} className="block text-sm font-medium text-slate-700">
                  {item.label.includes('*') ? (
                    <>
                      {item.label.split('<span')[0]} <span className="text-red-500">*</span>
                    </>
                  ) : (
                    item.label
                  )}
                </label>
                <input type="file" id={item.id} name={item.id} accept="image/*" multiple className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                <p className="text-sm text-slate-500">Upload up to 10 supported files: image. Max 100 MB per file.</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Tool kit <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="toolKit" value="Yes" checked={formData.toolKit === 'Yes'} onChange={handleChange} required className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="toolKit" value="No" checked={formData.toolKit === 'No'} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>

            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Stephny <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="stephny" value="Yes" checked={formData.stephny === 'Yes'} onChange={handleChange} required className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="stephny" value="No" checked={formData.stephny === 'No'} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>

            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Onboard Charger <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="onboardCharger" value="Yes" checked={formData.onboardCharger === 'Yes'} onChange={handleChange} required className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="onboardCharger" value="No" checked={formData.onboardCharger === 'No'} onChange={handleChange} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <label htmlFor="carInterior" className="block text-sm font-medium text-slate-700">Car Interior <span className="text-red-500">*</span></label>
              <select id="carInterior" name="carInterior" value={formData.carInterior} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                <option value="">Select status</option>
                {interiorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="physicalAuditPass" className="block text-sm font-medium text-slate-700">Physical Audit Pass <span className="text-red-500">*</span></label>
              <select id="physicalAuditPass" name="physicalAuditPass" value={formData.physicalAuditPass} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                <option value="">Select result</option>
                {auditPassOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <input type="hidden" name="latitude" value={formData.latitude} />
          <input type="hidden" name="longitude" value={formData.longitude} />

          <button type="submit" className="w-full rounded-3xl bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-slate-50">Submit Audit</button>
        </form>

        {status && (
          <p className={`mt-6 rounded-3xl px-5 py-4 text-center text-sm font-medium ${
            status.startsWith('Error') ? 'bg-red-50 text-red-700' : status.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-sky-50 text-sky-700'
          }`}>{status}</p>
        )}
      </div>
    </div>
  )
}

export default App