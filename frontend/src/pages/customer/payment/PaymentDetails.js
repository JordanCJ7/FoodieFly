import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

const PaymentDetails = ({ orderId }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);   // not working line 38 - 49
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {

        const orderId = localStorage.getItem("order_id");
        if (!orderId) {
          throw new Error("Order ID not found in local storage");
        }

        // Fetch payment details using orderId
        const paymentResponse = await axios.get(`http://localhost:5010/api/payment/${orderId}`, {//67fb9f1166b85ca6872bf93c
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        const paymentData = paymentResponse.data;
        setPaymentDetails(paymentData);

        //////////////////////    not working bcuz of no GET routes to fetch customer details by  customer ID

        // Fetch customer details using customerId from payment data
        // const customerResponse = await axios.get(`http://localhost:5001/api/user/${paymentData.customerId}`, {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        //   },
        // });

        // setCustomerDetails(customerResponse.data);

        //////////////////////////

      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              Payment Details
            </Typography>

            <Typography variant="body1">
              <strong>Customer Name:</strong> {customerDetails?.first_name} {customerDetails?.last_name}
            </Typography>
            <Typography variant="body1">
              <strong>Customer Email:</strong> {customerDetails?.email}
            </Typography>
            <Typography variant="body1">
              <strong>Order ID:</strong> {paymentDetails?.orderId}
            </Typography>
            <Typography variant="body1">
              <strong>Amount:</strong> {paymentDetails?.amount} {paymentDetails?.currency}
            </Typography>
            <Typography variant="body1">
              <strong>Payer Name:</strong> {paymentDetails?.payerName}
            </Typography>
            <Typography variant="body1">
              <strong>Paid At:</strong> {new Date(paymentDetails?.paidAt).toLocaleString()}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentDetails;