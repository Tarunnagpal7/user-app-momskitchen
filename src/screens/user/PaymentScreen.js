import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useCart } from "../../context/CartContext";
import { useSelector } from "react-redux";
import {
  OrderService,
  UserService,
  PaymentService,
} from "../../services/userServices";
import { initStripe, useStripe } from "@stripe/stripe-react-native";

export default function PaymentScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const gradientColors = ["#effef0", "#effef0"];

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const { cartItems, clearCart } = useCart();
  const user = useSelector((state) => state.auth.user);
  const [address, setAddress] = useState("");

  useEffect(() => {
    // ✅ Initialize Stripe SDK once
    initStripe({
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: "moms.kitchen", // for Apple Pay if needed
      merchantCountryCode: "IN", // ✅ important for GPay in India
      urlScheme: "moms.kitchen", // optional
    });

    const fetchUser = async () => {
      try {
        const me = await UserService.me();
        let addresses = me?.data?.data?.addresses || [];
        addresses = addresses.filter((adr) => adr.is_default);
        setAddress(addresses);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const addressId = address[0]?._id;

  // 🧮 Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + parseFloat(item.price.replace("₹", "")) * item.quantity,
    0
  );
  const deliveryFee = 30;
  const tax = subtotal * 0.15;
  const total = subtotal + deliveryFee + tax;

  const handlePaymentSelect = (method) => setSelectedPayment(method);

  // 🧾 COD ORDER
  const handlePlaceOrder = async () => {
    if (!addressId) {
      Alert.alert("Missing Address", "Please select a delivery address.");
      return;
    }
    if (!cartItems.length) {
      Alert.alert("Cart is Empty", "Please add items to your cart.");
      return;
    }

    setLoading(true);
    try {
      const orders = cartItems.map((item) => ({
        menu_id: item.id,
        items: item.quantity,
      }));

      const payload = {
        orders,
        delivery_address_id: addressId,
        special_instructions: specialInstructions,
      };

      const response = await OrderService.create(payload);
      if (response?.data?.status === "success") {
        clearCart();
        Alert.alert(
          "Order Confirmed 🎉",
          "Your COD order has been placed successfully!",
          [{ text: "OK", onPress: () => navigation.replace("Success") }]
        );
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Order Creation Error:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 💳 STRIPE ONLINE PAYMENT
  const handleStripePayment = async () => {
    try {
      setLoading(true);

      const orders = cartItems.map((item) => ({
        menu_id: item.id,
        items: item.quantity,
      }));

      const payload = {
        orders,
        delivery_address_id: addressId,
        special_instructions: specialInstructions,
      };

      // 1️⃣ Ask backend to create PaymentIntent
      const response = await OrderService.create(payload);
      const { clientSecret, paymentIntentId } = response?.data || {};
      if (!clientSecret) throw new Error("Stripe client secret not received.");

      // 2️⃣ Initialize Payment Sheet
      const initSheet = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Mom's Kitchen",
        allowsDelayedPaymentMethods: true,
        appearance: {
          theme: "light", // 👈 Force white/light mode even in dark mode phones
          colors: {
            primary: "#4CAF50", // Brand green
            background: "#FFFFFF", // White sheet background
            icon: "#4CAF50",
            error: "#D32F2F", // Red for error text/icons
          },
          shapes: {
            borderRadius: 10,
          },
          primaryButton: {
            colors: {
              background: "#4CAF50",
              text: "#FFFFFF",
            },
            shapes: {
              borderRadius: 12,
            },
          },
        },
      });

      if (initSheet.error) {
        Alert.alert("Error", initSheet.error.message);
        return;
      }

      // 3️⃣ Present Payment Sheet
      const paymentResult = await presentPaymentSheet();
      if (paymentResult.error) {
        console.log("Payment failed:", paymentResult.error);
        Alert.alert(
          "Payment Failed",
          paymentResult.error.message || "Payment was not completed."
        );

        // 🔁 Update order to cancelled
        await PaymentService.fail({ payment_intent_id: paymentIntentId });

        return;
      }

      // 4️⃣ Verify payment after success
      const verifyRes = await PaymentService.verify({
        payment_intent_id: paymentIntentId,
      });
      if (verifyRes?.data?.success) {
        clearCart();
        Alert.alert("Payment Successful 🎉", "Your order has been confirmed!", [
          { text: "OK", onPress: () => navigation.replace("Success") },
        ]);
      } else {
        Alert.alert("Verification Failed", "Please contact support.");
      }
    } catch (error) {
      console.error("Stripe Payment Error:", error);
      Alert.alert("Error", error?.message || "Unable to process payment.");
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Confirm Before Checkout
  const handleCheckout = () => {
    if (!addressId)
      return Alert.alert(
        "Missing Address",
        "Please select a delivery address."
      );
    if (!cartItems.length)
      return Alert.alert("Cart is Empty", "Please add items to your cart.");

    Alert.alert(
      "Confirm Your Order",
      `Proceed to ${
        selectedPayment === "online" ? "Online Payment" : "Cash on Delivery"
      } for INR ${total.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: async () =>
            selectedPayment === "cod"
              ? handlePlaceOrder()
              : await handleStripePayment(),
        },
      ]
    );
  };

  // UI
  return (
    <ScrollView>
      <LinearGradient colors={gradientColors} style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Payment
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>You deserve better meal</Text>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {cartItems.map((item, i) => (
            <View key={i} style={styles.orderItem}>
              <Image
                source={
                  item?.image?.url
                    ? { uri: item.image.url }
                    : require("../../../assets/images/food-platter.png")
                }
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  ₹{parseFloat(item.price.replace("₹", "")).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemCount}>{item.quantity} pcs</Text>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details Transaction</Text>
          <View style={styles.detailRow}>
            <Text>Fix Thali</Text>
            <Text>INR {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text>Driver</Text>
            <Text>INR {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text>Tax 10% + Fee 5%</Text>
            <Text>INR {tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>INR {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deliver to:</Text>
          {address ? (
            <>
              <Text>{user?.name}</Text>
              <Text>{user?.phone_number}</Text>
              <Text>{`${address[0].address_line}, ${address[0].city}, ${address[0].state} - ${address[0].pincode}`}</Text>
            </>
          ) : (
            <Text>No default address found</Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. No onions, extra spicy"
            multiline
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Method</Text>
          {["cod", "online"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                selectedPayment === method && styles.selectedPayment,
              ]}
              onPress={() => handlePaymentSelect(method)}
            >
              <MaterialCommunityIcons
                name={method === "cod" ? "cash" : "credit-card"}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.paymentText}>
                {method === "cod" ? "Cash on Delivery" : "Online Payment"}
              </Text>
              {selectedPayment === method && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? "Processing..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    minHeight: 60,
  },
  orderItem: { flexDirection: "row", alignItems: "center" },
  itemImage: { width: 60, height: 60, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  restaurantName: { fontSize: 16, fontWeight: "bold" },
  itemPrice: { fontSize: 14, color: "#666" },
  itemCount: { fontSize: 14, color: "#666" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 5,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },
  paymentSection: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  paymentTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPayment: { borderColor: "#4CAF50", backgroundColor: "#F1FBF2" },
  paymentText: { flex: 1, marginLeft: 10, fontSize: 14 },
  checkoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  checkoutButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
