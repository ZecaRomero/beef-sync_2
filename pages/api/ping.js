import { sendHealthCheck } from '../../utils/apiResponse'

export default function handler(req, res) {
  const healthData = {
    ok: true,
    time: new Date().toISOString()
  }
  
  return sendHealthCheck(res, healthData)
}