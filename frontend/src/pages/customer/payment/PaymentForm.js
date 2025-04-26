import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Dialog,
  DialogContent,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";


// { orderId, amount }
const PaymentForm = () => {  
    const [paymentData, setPaymentData] = useState({
        orderId: '',
        amount: '',
        customerId: '',
        restaurantId: '',
        paymentMethod: 'Credit Card'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState("");

    const handleChange = (e) => {
        setPaymentData({
            ...paymentData,
            [e.target.name]: e.target.value,
        });
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'card':
                return <CreditCardIcon />;
            case 'cash':
                return <PaymentsIcon />;
            case 'online':
                return <AccountBalanceWalletIcon />;
            default:
                return <PaymentIcon />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            if (paymentData.paymentMethod === 'online') {
                // Get payment gateway URL from your backend
                const response = await axios.post("/api/payments/initiate-online", paymentData);
                setPaymentUrl(response.data.paymentUrl);
                setShowPaymentGateway(true);
            } else {
                // Handle other payment methods as before
                const response = await axios.post("/api/payments", paymentData);
                setSuccess("Payment initiated successfully!");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await axios.post('http://localhost:5010/payments', formData);
    //         setMessage('Payment created successfully!');
    //     } catch (error) {
    //         console.error('Error creating payment:', error);
    //         setMessage('Failed to create payment.');
    //     }
    // };

    
    // Handle payment gateway window close
    const handlePaymentWindowClose = () => {
        setShowPaymentGateway(false);
        // You might want to check payment status here
        checkPaymentStatus();
    };

    // Check payment status after gateway closes
    const checkPaymentStatus = async () => {
        try {
            const response = await axios.get(`/api/payments/status/${paymentData.orderId}`);
            if (response.data.status === 'completed') {
                setSuccess('Payment completed successfully!');
            } else {
                setError('Payment was not completed. Please try again.');
            }
        } catch (error) {
            setError('Failed to verify payment status');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Box sx={{ textAlign: "center" }}>
                            <PaymentIcon
                                sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                            />
                            <Typography variant="h4" component="h1" gutterBottom>
                                Payment Details
                            </Typography>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Order ID"
                                    name="orderId"
                                    value={paymentData.orderId}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                />

                                <TextField
                                    label="Amount (LKR)"
                                    name="amount"
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: "LKR ",
                                    }}
                                />

                                <TextField
                                    label="Full Name"
                                    name="customerName"
                                    value={paymentData.customerName}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                />

                                <TextField
                                    label="Email"
                                    name="customerEmail"
                                    type="email"
                                    value={paymentData.customerEmail}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                />

                                <Divider sx={{ my: 2 }} />

                                <FormControl component="fieldset">
                                    <FormLabel component="legend" sx={{ mb: 2 }}>
                                        Select Payment Method
                                    </FormLabel>
                                    <RadioGroup
                                        name="paymentMethod"
                                        value={paymentData.paymentMethod}
                                        onChange={handleChange}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: 2,
                                        }}
                                    >
                                        <Paper 
                                            elevation={paymentData.paymentMethod === 'card' ? 3 : 1}
                                            sx={{
                                                p: 2,
                                                flex: 1,
                                                cursor: 'pointer',
                                                border: paymentData.paymentMethod === 'card' ? 2 : 1,
                                                borderColor: paymentData.paymentMethod === 'card' ? 'primary.main' : 'grey.300',
                                            }}
                                        >
                                            <FormControlLabel
                                                value="card"
                                                control={<Radio />}
                                                label={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <CreditCardIcon color="primary" />
                                                        <Typography>Card Payment</Typography>
                                                    </Stack>
                                                }
                                            />
                                        </Paper>

                                        <Paper 
                                            elevation={paymentData.paymentMethod === 'cash' ? 3 : 1}
                                            sx={{
                                                p: 2,
                                                flex: 1,
                                                cursor: 'pointer',
                                                border: paymentData.paymentMethod === 'cash' ? 2 : 1,
                                                borderColor: paymentData.paymentMethod === 'cash' ? 'primary.main' : 'grey.300',
                                            }}
                                        >
                                            <FormControlLabel
                                                value="cash"
                                                control={<Radio />}
                                                label={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <PaymentsIcon color="primary" />
                                                        <Typography>Cash Payment</Typography>
                                                    </Stack>
                                                }
                                            />
                                        </Paper>

                                        <Paper 
                                            elevation={paymentData.paymentMethod === 'online' ? 3 : 1}
                                            sx={{
                                                p: 2,
                                                flex: 1,
                                                cursor: 'pointer',
                                                border: paymentData.paymentMethod === 'online' ? 2 : 1,
                                                borderColor: paymentData.paymentMethod === 'online' ? 'primary.main' : 'grey.300',
                                            }}
                                        >
                                            <FormControlLabel
                                                value="online"
                                                control={<Radio />}
                                                label={
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <AccountBalanceWalletIcon color="primary" />
                                                        <Typography>Online Payment</Typography>
                                                    </Stack>
                                                }
                                            />
                                        </Paper>
                                    </RadioGroup>
                                </FormControl>


                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            getPaymentMethodIcon(paymentData.paymentMethod)
                                        )
                                    }
                                    sx={{
                                        py: 1.5,
                                        mt: 2,
                                        backgroundColor: "primary.main",
                                        "&:hover": {
                                            backgroundColor: "primary.dark",
                                        },
                                    }}
                                >
                                {loading ? "Processing..." : "Pay Now"}
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Paper>
            </Box>


            {/* Payment Gateway Dialog */}
            <Dialog 
                open={showPaymentGateway} 
                onClose={handlePaymentWindowClose}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0, height: '600px' }}>
                    <iframe
                        title="Payment Gateway"
                        src={paymentUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="payment"
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default PaymentForm;