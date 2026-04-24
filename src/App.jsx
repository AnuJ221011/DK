import { useState, useEffect, useRef } from 'react'

const initialState = {
  name: '',
  phone: '',
  email: '',
  cabNumber: '',
  auditDate: '',
  carAvailability: '',
  location: '',
  latitude: '',
  longitude: '',
  toolKit: '',
  stepney: '',
  onboardCharger: '',
  carInterior: '',
  physicalAuditPass: ''
}

const interiorOptions = ['Good', 'OK', 'Bad - Not usable']
const auditPassOptions = ['Good - Yes', 'OK - Yes', 'No - Accidental', 'No - Breakdown']
const carAvailabilityOptions = ['Available', 'Not Available']

const scriptURL = 'https://script.google.com/macros/s/AKfycbzfAcewSBh2M89odBvLAEKIal7-RyKKB_cIXYJI1dDJWJLef3lGB6mO849s7ycNvCqIKg/exec'

function App() {
  const [formData, setFormData] = useState(initialState)
  const [status, setStatus] = useState('')
  const [cabNumbers, setCabNumbers] = useState([])
  const [cabLoading, setCabLoading] = useState(true)
  const [cabSearch, setCabSearch] = useState('')
  const [cabOpen, setCabOpen] = useState(false)
  const cabRef = useRef(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMessage, setGeoMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isNotAvailable = formData.carAvailability === 'Not Available'

  useEffect(() => {
    fetch(scriptURL)
      .then(res => res.json())
      .then(data => setCabNumbers(data))
      .catch(() => setCabNumbers([]))
      .finally(() => setCabLoading(false))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cabRef.current && !cabRef.current.contains(e.target)) {
        setCabOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setGeoMessage('Geolocation is not supported by this browser.')
      return
    }

    setGeoLoading(true)
    setGeoMessage('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setGeoLoading(false)
        setGeoMessage('success')
      },
      (error) => {
        console.error('Error getting location:', error)
        setGeoLoading(false)
        setGeoMessage('Unable to capture location. Please allow location access.')
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.latitude || !formData.longitude) {
      setStatus('Geolocation is mandatory.')
      return
    }

    setSubmitting(true)

    try {
      const payload = { ...formData }

      const fileInputs = [
        'frontBumper',
        'leftSidePhoto',
        'rightSidePhoto',
        'rearBumper',
        'fitnessCertificate',
        'carInteriorPhoto',
        'odometerDashboard'
      ]

      for (let field of fileInputs) {
        const files = e.target[field]?.files ?? []
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
    } finally {
      setSubmitting(false)
    }
  }

  const fileUploadFields = [
    { id: 'frontBumper', label: 'Car Front Bumper' },
    { id: 'leftSidePhoto', label: 'Car Left Side Photo' },
    { id: 'rightSidePhoto', label: 'Car Right Side Photo' },
    { id: 'rearBumper', label: 'Car Rear Bumper' },
    { id: 'fitnessCertificate', label: 'Fitness Certificate' },
    { id: 'carInteriorPhoto', label: 'Car Interior Photo' },
    { id: 'odometerDashboard', label: 'Odometer Dashboard' }
  ]

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
              <label className="block text-sm font-medium text-slate-700">Cab Number <span className="text-red-500">*</span></label>
              <div ref={cabRef} className="relative">
                <button
                  type="button"
                  disabled={cabLoading}
                  onClick={() => setCabOpen(o => !o)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-left text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-wait flex items-center justify-between"
                >
                  <span className={formData.cabNumber ? 'text-slate-900' : 'text-slate-400'}>
                    {cabLoading ? 'Loading...' : formData.cabNumber || 'Select cab number'}
                  </span>
                  <svg className={`h-4 w-4 text-slate-500 transition-transform ${cabOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {cabOpen && (
                  <div className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search cab number..."
                        value={cabSearch}
                        onChange={e => setCabSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <ul className="max-h-52 overflow-y-auto pb-2">
                      {cabNumbers
                        .filter(cab => cab.toString().toLowerCase().includes(cabSearch.toLowerCase()))
                        .map(cab => (
                          <li
                            key={cab}
                            onClick={() => {
                              setFormData(f => ({ ...f, cabNumber: cab }))
                              setCabOpen(false)
                              setCabSearch('')
                            }}
                            className={`cursor-pointer px-4 py-2 text-sm transition hover:bg-sky-50 hover:text-sky-700 ${formData.cabNumber === cab ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-700'}`}
                          >
                            {cab}
                          </li>
                        ))}
                      {cabNumbers.filter(cab => cab.toString().toLowerCase().includes(cabSearch.toLowerCase())).length === 0 && (
                        <li className="px-4 py-2 text-sm text-slate-400">No results found</li>
                      )}
                    </ul>
                  </div>
                )}
                <input type="hidden" name="cabNumber" value={formData.cabNumber} required />
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="auditDate" className="block text-sm font-medium text-slate-700">Audit Date <span className="text-red-500">*</span></label>
              <input type="date" id="auditDate" name="auditDate" value={formData.auditDate} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
            <div className="space-y-3">
              <label htmlFor="carAvailability" className="block text-sm font-medium text-slate-700">Car Availability <span className="text-red-500">*</span></label>
              <select id="carAvailability" name="carAvailability" value={formData.carAvailability} onChange={handleChange} required className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                <option value="">Select availability</option>
                {carAvailabilityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location <span className="text-red-500">*</span></label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter location or use geolocation" className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Geolocation <span className="text-red-500">*</span></p>
              <button type="button" onClick={getLocation} disabled={geoLoading} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-70 disabled:cursor-not-allowed">
                {geoLoading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {geoLoading ? 'Fetching...' : 'Capture Geolocation'}
              </button>
              {geoMessage === 'success' && (
                <p className="mt-2 text-sm font-medium text-green-600">Location captured successfully.</p>
              )}
              {geoMessage && geoMessage !== 'success' && (
                <p className="mt-2 text-sm font-medium text-red-600">{geoMessage}</p>
              )}
            </div>
            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p><span className="font-semibold text-slate-900">Latitude:</span> <span className={formData.latitude ? 'text-green-600 font-semibold' : ''}>{formData.latitude || '–'}</span></p>
              <p><span className="font-semibold text-slate-900">Longitude:</span> <span className={formData.longitude ? 'text-green-600 font-semibold' : ''}>{formData.longitude || '–'}</span></p>
            </div>
          </div>

          {isNotAvailable && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-700">
              Car is marked as Not Available — photo uploads and submission are disabled.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {fileUploadFields.map((item) => (
              <div key={item.id} className={`space-y-3 ${isNotAvailable ? 'opacity-40' : ''}`}>
                <label htmlFor={item.id} className="block text-sm font-medium text-slate-700">
                  {item.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id={item.id}
                  name={item.id}
                  accept="image/*"
                  multiple
                  disabled={isNotAvailable}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-slate-500">Upload up to 10 supported files: image. Max 100 MB per file.</p>
              </div>
            ))}
          </div>

          <div className={`grid gap-6 lg:grid-cols-3 ${isNotAvailable ? 'opacity-40' : ''}`}>
            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Tool kit <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="toolKit" value="Yes" checked={formData.toolKit === 'Yes'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="toolKit" value="No" checked={formData.toolKit === 'No'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>

            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Stepney <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="stepney" value="Yes" checked={formData.stepney === 'Yes'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="stepney" value="No" checked={formData.stepney === 'No'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>

            <fieldset className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <legend className="text-sm font-semibold text-slate-700">Onboard Charger <span className="text-red-500">*</span></legend>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="onboardCharger" value="Yes" checked={formData.onboardCharger === 'Yes'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> Yes</label>
              <label className="flex items-center gap-3 text-sm text-slate-700"><input type="radio" name="onboardCharger" value="No" checked={formData.onboardCharger === 'No'} onChange={handleChange} disabled={isNotAvailable} className="h-4 w-4 text-sky-600 focus:ring-sky-500" /> No</label>
            </fieldset>
          </div>

          <div className={`grid gap-6 lg:grid-cols-2 ${isNotAvailable ? 'opacity-40' : ''}`}>
            <div className="space-y-3">
              <label htmlFor="carInterior" className="block text-sm font-medium text-slate-700">Car Interior <span className="text-red-500">*</span></label>
              <select id="carInterior" name="carInterior" value={formData.carInterior} onChange={handleChange} disabled={isNotAvailable} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed">
                <option value="">Select status</option>
                {interiorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label htmlFor="physicalAuditPass" className="block text-sm font-medium text-slate-700">Physical Audit Pass <span className="text-red-500">*</span></label>
              <select id="physicalAuditPass" name="physicalAuditPass" value={formData.physicalAuditPass} onChange={handleChange} disabled={isNotAvailable} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed">
                <option value="">Select result</option>
                {auditPassOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <input type="hidden" name="latitude" value={formData.latitude} />
          <input type="hidden" name="longitude" value={formData.longitude} />

          <button
            type="submit"
            disabled={isNotAvailable || submitting}
            className="w-full rounded-3xl bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {submitting ? 'Submitting...' : 'Submit Audit'}
          </button>
        </form>

        {status && (
          <p className={`mt-6 rounded-3xl px-5 py-4 text-center text-sm font-medium ${
            status.startsWith('Submission failed') ? 'bg-red-50 text-red-700' : status.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-sky-50 text-sky-700'
          }`}>{status}</p>
        )}
      </div>
    </div>
  )
}

export default App
