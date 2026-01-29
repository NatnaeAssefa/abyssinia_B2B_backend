import axios from "axios";
import { env } from "../../config";

interface ChappaInitializePaymentOptions {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

interface ChappaVerifyPaymentOptions {
  tx_ref: string;
}

class ChappaService {
  private static baseUrl = env.CHAPPA_BASE_URL || "https://api.chapa.co";
  private static secretKey = env.CHAPPA_SECRET_KEY as string;
  
  static initializePayment = async (options: ChappaInitializePaymentOptions) => {
    try {
      console.log(`Attempting to connect to Chappa API at: ${this.baseUrl}`);
      
      const response = await axios.post(
        `${this.baseUrl}/v1/transaction/initialize`, 
        options,
        {
          headers: {
            "Authorization": `Bearer ${this.secretKey}`,
            "Content-Type": "application/json"
          },
          timeout: 10000 // Add a timeout of 10 seconds
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error("Chappa initialize payment error:", error);
      
      // More detailed error logging
      if (error.code === 'ENOTFOUND') {
        console.error(`DNS resolution failed for ${this.baseUrl}. Please check if the API endpoint is correct.`);
      } else if (error.code === 'ECONNREFUSED') {
        console.error(`Connection refused to ${this.baseUrl}. The server might be down.`);
      } else if (error.response) {
        console.error(`Chappa API responded with status ${error.response.status}:`, error.response.data);
      }
      
      throw error;
    }
  }
  
  static verifyPayment = async (options: ChappaVerifyPaymentOptions) => {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/transaction/verify/${options.tx_ref}`,
        {
          headers: {
            "Authorization": `Bearer ${this.secretKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error("Chappa verify payment error:", error);
      throw error;
    }
  }

  /**
   * Process a refund for a completed payment
   * @param {Object} params - Refund parameters
   * @param {string} params.tx_ref - Transaction reference of the payment to refund
   * @param {number} params.amount - Amount to refund (can be partial)
   * @param {string} params.reason - Reason for the refund
   * @returns {Promise<any>} - Refund response from Chappa
   */
  static processRefund = (params: { tx_ref: string; amount: number; reason: string }): Promise<any> => {
    return new Promise((resolve, reject) => {
      const { tx_ref, amount, reason } = params
      
      // Prepare the request payload
      const payload = {
        tx_ref,
        amount,
        reason
      }
      
      // Make API request to Chappa refund endpoint
      axios({
        method: 'post',
        url: `${env.CHAPPA_BASE_URL}/transaction/refund`,
        headers: {
          'Authorization': `Bearer ${env.CHAPPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        data: payload
      })
        .then(response => {
          if (response.data && response.data.status === 'success') {
            resolve(response.data)
          } else {
            reject(new Error(response.data?.message || 'Refund request failed'))
          }
        })
        .catch(error => {
          reject(error.response?.data || error.message || error)
        })
    })
  }
}

export default ChappaService


