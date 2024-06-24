import mongoose from 'mongoose'

const feedbackSchema = mongoose.Schema({
  nama_lengkap: {
    type: String,
  },
  user_ad: {
    type: String,
  },
  email: {
    type: String,
  },
  no_wa: {
    type: String,
  },
  departemen_tim: {
    type: String,
  },
  id_kasus: {
    type: String,
  },
  deskripsi_aktivitas: {
    type: String,
  },
  mengetahui_aktivitas: {
    type: String,
  },
  membagikan_info_login: {
    type: String,
  },
  menggunakan_vpn: {
    type: String,
  },
  membuka_tautan_mencurigakan: {
    type: String,
  },
})

export default mongoose.model('Feedback', feedbackSchema)
