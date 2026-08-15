import type { RequestStatus } from '@/lib/types'

export type Lang = 'en' | 'ta'

export type TranslationKey =
  | 'app.name'
  | 'app.tagline'
  | 'language'
  | 'submitRequest'
  | 'publicFormTitle'
  | 'publicFormSubtitle'
  | 'section.personal'
  | 'section.location'
  | 'section.request'
  | 'name'
  | 'initial'
  | 'mobile'
  | 'alternateMobile'
  | 'district'
  | 'taluk'
  | 'localBodyType'
  | 'localBody'
  | 'ward'
  | 'assemblyConstituency'
  | 'parliamentConstituency'
  | 'address'
  | 'requestCategory'
  | 'subject'
  | 'description'
  | 'attachment'
  | 'consent'
  | 'submit'
  | 'submitting'
  | 'success.title'
  | 'success.message'
  | 'copyId'
  | 'copied'
  | 'downloadReceipt'
  | 'sendWhatsApp'
  | 'newRequest'
  | 'requestId'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'assignedTo'
  | 'internalNotes'
  | 'actions'
  | 'view'
  | 'edit'
  | 'download'
  | 'search'
  | 'filter'
  | 'clear'
  | 'exportExcel'
  | 'exportCsv'
  | 'dashboard.title'
  | 'dashboard.total'
  | 'dashboard.new'
  | 'dashboard.underReview'
  | 'dashboard.inProgress'
  | 'dashboard.resolved'
  | 'requests'
  | 'backToDashboard'
  | 'logout'
  | 'login.title'
  | 'email'
  | 'password'
  | 'login'
  | 'loginError'
  | 'setPassword.title'
  | 'setPassword.subtitle'
  | 'newPassword'
  | 'confirmPassword'
  | 'passwordMismatch'
  | 'passwordTooShort'
  | 'savePassword'
  | 'forgotPassword'
  | 'resetPassword'
  | 'resetSent'
  | 'backToLogin'
  | 'status.NEW'
  | 'status.UNDER_REVIEW'
  | 'status.IN_PROGRESS'
  | 'status.RESOLVED'
  | 'status.REJECTED'
  | 'status.DUPLICATE'
  | 'selectOption'
  | 'required'
  | 'invalidMobile'
  | 'pleaseConsent'
  | 'tryAgain'
  | 'backHome'
  | 'save'
  | 'cancel'
  | 'requestDetails'
  | 'category'
  | 'mobileNumber'
  | 'noResults'
  | 'appliedFilters'
  | 'createdByPublic'
  | 'whatsApp'
  | 'receipt'
  | 'qr'
  | 'attachments'
  | 'manage'
  | 'unassigned'
  | 'internalNotesHint'
  | 'saveChanges'
  | 'saving'
  | 'saved'
  | 'sendViaWhatsApp'
  | 'prev'
  | 'next'
  | 'results'
  | 'page'
  | 'of'
  | 'from'
  | 'to'
  | 'searchPlaceholder'
  | 'adminLogin'
  | 'loading'
  | 'delete'
  | 'deleteRequest'
  | 'deleting'
  | 'confirmDelete'
  | 'track'
  | 'track.title'
  | 'track.subtitle'
  | 'track.button'
  | 'track.notFound'

const en: Record<TranslationKey, string> = {
  'app.name': 'Public Request Management',
  'app.tagline': 'Submit and track public service requests',
  language: 'Language',
  submitRequest: 'Submit a Request',
  publicFormTitle: 'Submit a Public Request',
  publicFormSubtitle: 'Fill the form below. Your request will be reviewed by the office.',
  'section.personal': 'Personal Details',
  'section.location': 'Location',
  'section.request': 'Request',
  name: 'Name',
  initial: 'Initial',
  mobile: 'Mobile Number',
  alternateMobile: 'Alternate Mobile',
  district: 'District',
  taluk: 'Taluk',
  localBodyType: 'Local Body Type',
  localBody: 'Local Body',
  ward: 'Ward',
  assemblyConstituency: 'Assembly Constituency',
  parliamentConstituency: 'Parliament Constituency',
  address: 'Address',
  requestCategory: 'Request Category',
  subject: 'Subject',
  description: 'Description',
  attachment: 'Attachment',
  consent:
    'I consent to provide my personal details for processing this request and agree they may be used for official follow-up.',
  submit: 'Submit Request',
  submitting: 'Submitting...',
  'success.title': 'Request Submitted Successfully',
  'success.message': 'Your request has been submitted successfully. Your Request ID is:',
  copyId: 'Copy Request ID',
  copied: 'Copied!',
  downloadReceipt: 'Download Receipt',
  sendWhatsApp: 'Send via WhatsApp',
  newRequest: 'Submit Another Request',
  requestId: 'Request ID',
  status: 'Status',
  createdAt: 'Created Date',
  updatedAt: 'Updated Date',
  assignedTo: 'Assigned To',
  internalNotes: 'Internal Notes',
  actions: 'Actions',
  view: 'View',
  edit: 'Edit',
  download: 'Download',
  search: 'Search',
  filter: 'Filter',
  clear: 'Clear',
  exportExcel: 'Export Excel',
  exportCsv: 'Export CSV',
  'dashboard.title': 'Requests Dashboard',
  'dashboard.total': 'Total',
  'dashboard.new': 'New',
  'dashboard.underReview': 'Under Review',
  'dashboard.inProgress': 'In Progress',
  'dashboard.resolved': 'Resolved',
  requests: 'Requests',
  backToDashboard: 'Back to Dashboard',
  logout: 'Logout',
  'login.title': 'Admin Login',
  email: 'Email',
  password: 'Password',
  login: 'Login',
  loginError: 'Invalid email or password.',
  'setPassword.title': 'Set Your Password',
  'setPassword.subtitle': 'Set a password so you can log in with your email next time.',
  newPassword: 'New Password',
  confirmPassword: 'Confirm Password',
  passwordMismatch: 'Passwords do not match.',
  passwordTooShort: 'Password must be at least 6 characters.',
  savePassword: 'Save Password',
  forgotPassword: 'Forgot password?',
  resetPassword: 'Reset Password',
  resetSent:
    'A password reset link has been sent to your email. Open it and set a new password.',
  backToLogin: 'Back to Login',
  'status.NEW': 'New',
  'status.UNDER_REVIEW': 'Under Review',
  'status.IN_PROGRESS': 'In Progress',
  'status.RESOLVED': 'Resolved',
  'status.REJECTED': 'Rejected',
  'status.DUPLICATE': 'Duplicate',
  selectOption: 'Select',
  required: 'This field is required',
  invalidMobile: 'Enter a valid 10-digit mobile number',
  pleaseConsent: 'Please accept the consent to submit.',
  tryAgain: 'Something went wrong. Please try again.',
  backHome: 'Back to Home',
  save: 'Save',
  cancel: 'Cancel',
  requestDetails: 'Request Details',
  category: 'Category',
  mobileNumber: 'Mobile Number',
  noResults: 'No requests found.',
  appliedFilters: 'Applied Filters',
  createdByPublic: 'Submitted by the public',
  whatsApp: 'WhatsApp',
  receipt: 'Receipt',
  qr: 'QR',
  attachments: 'Attachments',
  manage: 'Manage',
  unassigned: '— Unassigned —',
  internalNotesHint: '(not visible to the public)',
  saveChanges: 'Save Changes',
  saving: 'Saving…',
  saved: 'Saved.',
  sendViaWhatsApp: 'Send via WhatsApp',
  prev: 'Prev',
  next: 'Next',
  results: 'results',
  page: 'page',
  of: 'of',
  from: 'From',
  to: 'to',
  searchPlaceholder: 'Search by Request ID, Name or Mobile…',
  adminLogin: 'Admin Login',
  loading: 'Loading…',
  delete: 'Delete',
  deleteRequest: 'Delete Request',
  deleting: 'Deleting…',
  confirmDelete:
    'Are you sure you want to delete this request? This permanently removes it and its attachments.',
  track: 'Track Request',
  'track.title': 'Track Your Request',
  'track.subtitle': 'Enter your Request ID and the mobile number you submitted with to see the current status.',
  'track.button': 'Check Status',
  'track.notFound': 'No request found for this Request ID and mobile number. Please check and try again.',
}

const ta: Record<TranslationKey, string> = {
  'app.name': 'பொது கோரிக்கை மேலாண்மை',
  'app.tagline': 'பொது சேவை கோரிக்கைகளை சமர்ப்பித்து கண்காணிக்கவும்',
  language: 'மொழி',
  submitRequest: 'கோரிக்கை சமர்ப்பிக்கவும்',
  publicFormTitle: 'பொது கோரிக்கையை சமர்ப்பிக்கவும்',
  publicFormSubtitle: 'கீழே உள்ள படிவத்தை பூர்த்தி செய்யவும். உங்கள் கோரிக்கை அலுவலகத்தால் பரிசீலிக்கப்படும்.',
  'section.personal': 'தனிப்பட்ட விவரங்கள்',
  'section.location': 'இடம்',
  'section.request': 'கோரிக்கை',
  name: 'பெயர்',
  initial: 'முதலெழுத்து',
  mobile: 'கைபேசி எண்',
  alternateMobile: 'மாற்று கைபேசி எண்',
  district: 'மாவட்டம்',
  taluk: 'வட்டம்',
  localBodyType: 'உள்ளாட்சி அமைப்பு வகை',
  localBody: 'உள்ளாட்சி அமைப்பு',
  ward: 'வார்டு',
  assemblyConstituency: 'சட்டமன்றத் தொகுதி',
  parliamentConstituency: 'நாடாளுமன்றத் தொகுதி',
  address: 'முகவரி',
  requestCategory: 'கோரிக்கை வகை',
  subject: 'தலைப்பு',
  description: 'விவரம்',
  attachment: 'இணைப்பு',
  consent:
    'இந்த கோரிக்கையை செயலாக்குவதற்காக எனது தனிப்பட்ட விவரங்களை வழங்க ஒப்புக்கொள்கிறேன், மேலும் அவை அதிகாரப்பூர்வ பின்தொடரலுக்கு பயன்படுத்தப்படலாம்.',
  submit: 'கோரிக்கையைச் சமர்ப்பிக்கவும்',
  submitting: 'சமர்ப்பிக்கப்படுகிறது...',
  'success.title': 'கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது',
  'success.message': 'உங்கள் கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டுள்ளது. உங்கள் கோரிக்கை எண்:',
  copyId: 'கோரிக்கை எண்ணை நகலெடுக்கவும்',
  copied: 'நகலெடுக்கப்பட்டது!',
  downloadReceipt: 'ரசீதை பதிவிறக்கவும்',
  sendWhatsApp: 'வாட்ஸ்அப்பில் அனுப்பவும்',
  newRequest: 'மற்றொரு கோரிக்கையை சமர்ப்பிக்கவும்',
  requestId: 'கோரிக்கை எண்',
  status: 'நிலை',
  createdAt: 'உருவாக்கப்பட்ட தேதி',
  updatedAt: 'புதுப்பிக்கப்பட்ட தேதி',
  assignedTo: 'ஒதுக்கப்பட்ட நபர்',
  internalNotes: 'உள் குறிப்புகள்',
  actions: 'செயல்கள்',
  view: 'பார்க்க',
  edit: 'திருத்து',
  download: 'பதிவிறக்கு',
  search: 'தேடு',
  filter: 'வடிகட்டு',
  clear: 'அழி',
  exportExcel: 'எக்செல் ஏற்றுமதி',
  exportCsv: 'சிஎஸ்வி ஏற்றுமதி',
  'dashboard.title': 'கோரிக்கைகள் டாஷ்போர்டு',
  'dashboard.total': 'மொத்தம்',
  'dashboard.new': 'புதியது',
  'dashboard.underReview': 'பரிசீலனையில் உள்ளது',
  'dashboard.inProgress': 'செயல்பாட்டில் உள்ளது',
  'dashboard.resolved': 'தீர்வு காணப்பட்டது',
  requests: 'கோரிக்கைகள்',
  backToDashboard: 'டாஷ்போர்டுக்கு திரும்பு',
  logout: 'வெளியேறு',
  'login.title': 'நிர்வாகி உள்நுழைவு',
  email: 'மின்னஞ்சல்',
  password: 'கடவுச்சொல்',
  login: 'உள்நுழையவும்',
  loginError: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.',
  'setPassword.title': 'உங்கள் கடவுச்சொல்லை அமைக்கவும்',
  'setPassword.subtitle': 'அடுத்த முறை உங்கள் மின்னஞ்சலுடன் உள்நுழைய கடவுச்சொல்லை அமைக்கவும்.',
  newPassword: 'புதிய கடவுச்சொல்',
  confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
  passwordMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
  passwordTooShort: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகளாக இருக்க வேண்டும்.',
  savePassword: 'கடவுச்சொல்லை சேமி',
  forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
  resetPassword: 'கடவுச்சொல்லை மீட்டமை',
  resetSent:
    'உங்கள் மின்னஞ்சலுக்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது. அதைத் திறந்து புதிய கடவுச்சொல்லை அமைக்கவும்.',
  backToLogin: 'உள்நுழைவுக்கு திரும்பு',
  'status.NEW': 'புதியது',
  'status.UNDER_REVIEW': 'பரிசீலனையில் உள்ளது',
  'status.IN_PROGRESS': 'செயல்பாட்டில் உள்ளது',
  'status.RESOLVED': 'தீர்வு காணப்பட்டது',
  'status.REJECTED': 'நிராகரிக்கப்பட்டது',
  'status.DUPLICATE': 'நகல் கோரிக்கை',
  selectOption: 'தேர்ந்தெடுக்கவும்',
  required: 'இந்த புலம் கட்டாயமானது',
  invalidMobile: 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்',
  pleaseConsent: 'சமர்ப்பிக்க ஒப்புதல் அளிக்கவும்.',
  tryAgain: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
  backHome: 'முகப்புக்கு திரும்பு',
  save: 'சேமி',
  cancel: 'ரத்து',
  requestDetails: 'கோரிக்கை விவரங்கள்',
  category: 'வகை',
  mobileNumber: 'கைபேசி எண்',
  noResults: 'கோரிக்கைகள் இல்லை.',
  appliedFilters: 'பயன்படுத்தப்பட்ட வடிகட்டிகள்',
  createdByPublic: 'பொதுமக்களால் சமர்ப்பிக்கப்பட்டது',
  whatsApp: 'வாட்ஸ்அப்',
  receipt: 'ரசீது',
  qr: 'கியூஆர்',
  attachments: 'இணைப்புகள்',
  manage: 'நிர்வகி',
  unassigned: '— ஒதுக்கப்படவில்லை —',
  internalNotesHint: '(பொதுமக்களுக்கு தெரியாது)',
  saveChanges: 'மாற்றங்களை சேமி',
  saving: 'சேமிக்கப்படுகிறது...',
  saved: 'சேமிக்கப்பட்டது.',
  sendViaWhatsApp: 'வாட்ஸ்அப்பில் அனுப்பவும்',
  prev: 'முந்தையது',
  next: 'அடுத்தது',
  results: 'முடிவுகள்',
  page: 'பக்கம்',
  of: 'இல்',
  from: 'முதல்',
  to: 'வரை',
  searchPlaceholder: 'கோரிக்கை எண், பெயர் அல்லது கைபேசி எண்ணில் தேடு…',
  adminLogin: 'நிர்வாகி உள்நுழைவு',
  loading: 'ஏற்றப்படுகிறது…',
  delete: 'நீக்கு',
  deleteRequest: 'கோரிக்கையை நீக்கு',
  deleting: 'நீக்கப்படுகிறது…',
  confirmDelete:
    'இந்த கோரிக்கையை நீக்க விரும்புகிறீர்களா? இது நிரந்தரமாக அதன் இணைப்புகளுடன் நீக்கப்படும்.',
  track: 'கோரிக்கையை கண்காணிக்க',
  'track.title': 'உங்கள் கோரிக்கையை கண்காணிக்கவும்',
  'track.subtitle': 'உங்கள் கோரிக்கை எண் மற்றும் சமர்ப்பித்த கைபேசி எண்ணை உள்ளிட்டு தற்போதைய நிலையை காண்க.',
  'track.button': 'நிலையை சரிபார்க்கவும்',
  'track.notFound': 'இந்த கோரிக்கை எண் மற்றும் கைபேசி எண்ணுக்கு கோரிக்கை இல்லை. மீண்டும் சரிபார்க்கவும்.',
}

const dict: Record<Lang, Record<TranslationKey, string>> = { en, ta }

export function t(lang: Lang, key: TranslationKey): string {
  return dict[lang][key] ?? dict.en[key] ?? key
}

export const STATUS_LABELS: Record<RequestStatus, { en: string; ta: string }> = {
  NEW: { en: 'New', ta: 'புதியது' },
  UNDER_REVIEW: { en: 'Under Review', ta: 'பரிசீலனையில் உள்ளது' },
  IN_PROGRESS: { en: 'In Progress', ta: 'செயல்பாட்டில் உள்ளது' },
  RESOLVED: { en: 'Resolved', ta: 'தீர்வு காணப்பட்டது' },
  REJECTED: { en: 'Rejected', ta: 'நிராகரிக்கப்பட்டது' },
  DUPLICATE: { en: 'Duplicate', ta: 'நகல் கோரிக்கை' },
}

export const ALL_STATUSES: RequestStatus[] = [
  'NEW',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'DUPLICATE',
]
