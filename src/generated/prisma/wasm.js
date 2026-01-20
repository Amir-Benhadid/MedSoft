
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PatientScalarFieldEnum = {
  id: 'id',
  name: 'name',
  surname: 'surname',
  dob: 'dob',
  address: 'address',
  phoneNumber: 'phoneNumber',
  phone: 'phone',
  email: 'email',
  bloodType: 'bloodType',
  status: 'status',
  consultationStart: 'consultationStart',
  medicalHistory: 'medicalHistory',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  doctorId: 'doctorId'
};

exports.Prisma.ConsultationScalarFieldEnum = {
  id: 'id',
  date: 'date',
  type: 'type',
  notes: 'notes',
  diagnosis: 'diagnosis',
  prescription: 'prescription',
  duration: 'duration',
  clinicalExam: 'clinicalExam',
  dilatationRequired: 'dilatationRequired',
  leftEye: 'leftEye',
  rightEye: 'rightEye',
  secretaryNeeded: 'secretaryNeeded',
  secretaryNote: 'secretaryNote',
  followUp: 'followUp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  patientId: 'patientId'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  basePrice: 'basePrice',
  discount: 'discount',
  isFree: 'isFree',
  total: 'total',
  paid: 'paid',
  date: 'date',
  consultationId: 'consultationId'
};

exports.Prisma.ImageScalarFieldEnum = {
  id: 'id',
  type: 'type',
  url: 'url',
  title: 'title',
  description: 'description',
  date: 'date',
  consultationId: 'consultationId'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  fileUrl: 'fileUrl',
  type: 'type',
  date: 'date',
  consultationId: 'consultationId'
};

exports.Prisma.AppointmentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  start: 'start',
  end: 'end',
  patientId: 'patientId',
  patientName: 'patientName',
  notes: 'notes',
  status: 'status',
  state: 'state',
  isGroup: 'isGroup',
  groupPatientIds: 'groupPatientIds',
  consultationType: 'consultationType',
  needsDilation: 'needsDilation',
  isDilated: 'isDilated',
  dilationCompletedAt: 'dilationCompletedAt',
  arrivedAt: 'arrivedAt',
  completedAt: 'completedAt',
  paymentInfo: 'paymentInfo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AntecedentScalarFieldEnum = {
  id: 'id',
  description: 'description',
  date: 'date',
  type: 'type',
  patientId: 'patientId'
};

exports.Prisma.WaitlistEntryScalarFieldEnum = {
  id: 'id',
  arrivedAt: 'arrivedAt',
  date: 'date',
  patientId: 'patientId',
  needsDilation: 'needsDilation',
  isDilated: 'isDilated',
  dilationCompletedAt: 'dilationCompletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  text: 'text',
  sender: 'sender',
  timestamp: 'timestamp',
  isRead: 'isRead',
  sentById: 'sentById',
  createdAt: 'createdAt'
};

exports.Prisma.TodoItemScalarFieldEnum = {
  id: 'id',
  text: 'text',
  isCompleted: 'isCompleted',
  completedAt: 'completedAt',
  date: 'date',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgendaScalarFieldEnum = {
  id: 'id',
  date: 'date',
  timeSlot: 'timeSlot',
  isAvailable: 'isAvailable',
  patientId: 'patientId',
  patientName: 'patientName',
  consultationType: 'consultationType',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TarifScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  category: 'category',
  isActive: 'isActive',
  duration: 'duration',
  code: 'code',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Patient: 'Patient',
  Consultation: 'Consultation',
  Invoice: 'Invoice',
  Image: 'Image',
  Document: 'Document',
  Appointment: 'Appointment',
  Antecedent: 'Antecedent',
  WaitlistEntry: 'WaitlistEntry',
  Message: 'Message',
  TodoItem: 'TodoItem',
  Agenda: 'Agenda',
  Tarif: 'Tarif'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
