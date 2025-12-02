import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card, useTheme, ActivityIndicator } from "react-native-paper";
import { OrderService, settingsService } from "../../services/userServices";

const STATUS_TABS = ["pending", "delivered", "cancelled"];

export default function OrdersScreen() {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canCancel, setCanCancel] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      const fetchedSettings = res.data?.data?.settings;
      setSettings(fetchedSettings);
      checkCancellationTime(fetchedSettings);
    } catch (e) {
      console.log("Load Settings Error:", e);
    }
  };

  const checkCancellationTime = (currentSettings) => {
    // Use ordering windows as cancellation windows for now, or add specific cancellationWindows to settings if needed.
    // Assuming cancellation allowed during ordering hours.
    if (!currentSettings?.orderingWindows) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const isTime = currentSettings.orderingWindows.some(window => {
      return currentTimeStr >= window.start && currentTimeStr <= window.end;
    });

    setCanCancel(isTime);
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await OrderService.list({ limit: 50 });
      setOrders(res.data.data?.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    loadSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (settings) checkCancellationTime(settings);
    }, 60000);
    return () => clearInterval(interval);
  }, [settings]);

  const handleCancelPress = (order) => {
    if (!canCancel) {
      alert("Cancellations are only allowed during ordering hours.");
      return;
    }

    let message = "Are you sure you want to cancel this order?";

    if (order.payment_status === 'paid') {
      const penalty = (order.delivery_fee || 0) + (order.tax || 0);
      const refund = order.total_amount - penalty;

      message += `\n\nRefund Breakdown:\n` +
        `• Total Amount: ₹${order.total_amount}\n` +
        `• Cancellation Penalty (Delivery + Tax): -₹${penalty}\n` +
        `• Estimated Refund: ₹${refund}\n\n` +
        `The refund will be processed after admin approval.`;
    }

    Alert.alert(
      "Cancel Order",
      message,
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => cancelOrder(order._id) }
      ]
    );
  };

  const cancelOrder = async (id) => {
    try {
      const res = await OrderService.cancel(id);
      const updated = res?.data?.data?.order ||
        res?.data?.data || { status: "cancelled" };

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, ...updated, status: "cancelled" } : order
        )
      );

      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, ...updated, status: "cancelled" });
      }

      alert("Order cancelled successfully");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFD54F";
      case "confirmed":
        return "#64B5F6";
      case "preparing":
        return "#4DB6AC";
      case "out_for_delivery":
        return "#81C784";
      case "delivered":
        return "#66BB6A";
      case "cancelled":
        return "#E57373";
      default:
        return "#BDBDBD";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "clock-outline";
      case "confirmed":
        return "check-circle-outline";
      case "preparing":
        return "chef-hat";
      case "out_for_delivery":
        return "truck-delivery-outline";
      case "delivered":
        return "check-circle";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "information-outline";
    }
  };

  const filteredOrders = orders.filter((o) => {
    // For the Pending tab, include multiple active statuses
    if (activeTab === "pending") {
      return ["pending", "confirmed", "preparing", "out_for_delivery"].includes(
        o.status
      );
    }

    // For all other tabs (like delivered, cancelled, etc.)
    return o.status === activeTab;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} total orders
          </Text>
        </View>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshBtn}>
          <MaterialCommunityIcons name="refresh" size={24} color="#0C3415" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {STATUS_TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    activeTab === tab && styles.activeBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      activeTab === tab && styles.activeBadgeText,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedOrder(item)}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        {/* Status Bar */}
        <View
          style={[
            styles.statusBar,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />

        <View style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={20}
                color="#0C3415"
              />
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.menu_id?.name || "Menu"}
                </Text>
                <Text style={styles.orderId}>Order #{item._id?.slice(-6)}</Text>
              </View>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(item.status)}
                size={14}
                color={getStatusColor(item.status)}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          {/* Amount and Payment Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="cash" size={16} color="#666" />
              <Text style={styles.infoLabel}>Total Amount</Text>
            </View>
            <Text style={styles.amount}>₹{item.total_amount}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name={
                  item.payment_status === "paid"
                    ? "check-circle"
                    : "clock-outline"
                }
                size={16}
                color={item.payment_status === "paid" ? "#4CAF50" : "#FF9800"}
              />
              <Text style={styles.infoLabel}>Payment</Text>
            </View>
            <Text
              style={[
                styles.paymentStatus,
                {
                  color: item.payment_status === "paid" ? "#4CAF50" : item.payment_status === "refunded" ? "#2196F3" : "#FF9800",
                },
              ]}
            >
              {item.payment_status === "refunded" ? "Refunded" : item.payment_status}
            </Text>
          </View>

          {/* Refund Amount Display */}
          {item.payment_status === "refunded" && item.refund_amount > 0 && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="cash-refund" size={16} color="#2196F3" />
                <Text style={styles.infoLabel}>Refunded Amount</Text>
              </View>
              <Text style={[styles.amount, { color: "#2196F3" }]}>₹{item.refund_amount}</Text>
            </View>
          )}

          {/* Action Button */}
          {['pending', 'confirmed'].includes(item.status) && (
            <TouchableOpacity
              style={[styles.cancelBtn, !canCancel && styles.disabledButton]}
              onPress={() => handleCancelPress(item)}
              activeOpacity={0.7}
              disabled={!canCancel}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={18}
                color={!canCancel ? "#999" : "#B00020"}
              />
              <Text style={[styles.cancelBtnText, !canCancel && { color: "#999" }]}>
                {canCancel ? "Cancel Order" : "Cancellation Closed"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetails = () => {
    if (!selectedOrder) return null;
    const o = selectedOrder;
    return (
      <ScrollView
        style={styles.detailsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setSelectedOrder(null)}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0C3415" />
          <Text style={styles.backBtnText}>Back to Orders</Text>
        </TouchableOpacity>

        {/* Order Header Card */}
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderTop}>
            <Text style={styles.detailTitle}>Order #{o._id?.slice(-6)}</Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: getStatusColor(o.status) + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(o.status)}
                size={16}
                color={getStatusColor(o.status)}
              />
              <Text
                style={[styles.statusText, { color: getStatusColor(o.status) }]}
              >
                {o.status}
              </Text>
            </View>
          </View>
          <View style={styles.detailAmountRow}>
            <Text style={styles.detailAmount}>₹{o.total_amount}</Text>
            <Text
              style={[
                styles.paymentStatus,
                { color: o.payment_status === "paid" ? "#4CAF50" : o.payment_status === "refunded" ? "#2196F3" : "#FF9800" },
              ]}
            >
              Payment: {o.payment_status === "refunded" ? "Refunded" : o.payment_status}
            </Text>
          </View>

          {/* Refund Amount in Details */}
          {o.payment_status === "refunded" && o.refund_amount > 0 && (
            <View style={[styles.detailAmountRow, { marginTop: 8 }]}>
              <Text style={[styles.detailAmount, { color: "#2196F3", fontSize: 16 }]}>
                Refunded: ₹{o.refund_amount}
              </Text>
            </View>
          )}
        </View>

        {/* Menu Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="food" size={20} color="#0C3415" />
            <Text style={styles.sectionTitle}>Menu Details</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.menuName}>{o.menu_id?.name}</Text>
            <Text style={styles.menuDescription}>{o.menu_id?.description}</Text>
            {o.menu_id?.items?.map((it, idx) => (
              <View key={idx} style={styles.menuItem}>
                <MaterialCommunityIcons
                  name={it.veg ? "leaf" : "food-drumstick"}
                  size={14}
                  color={it.veg ? "#4CAF50" : "#F44336"}
                />
                <Text style={styles.menuItemText}>{it.item_name}</Text>
                <Text
                  style={[
                    styles.menuItemType,
                    { color: it.veg ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {it.veg ? "Veg" : "Non-Veg"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mom Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-heart"
              size={20}
              color="#0C3415"
            />
            <Text style={styles.sectionTitle}>Mom Details</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={16} color="#666" />
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{o.mom_id?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={16} color="#666" />
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{o.mom_id?.phone_number}</Text>
            </View>
          </View>
        </View>

        {/* Cancel Button in Details */}
        {['pending', 'confirmed'].includes(o.status) && (
          <View style={{ paddingHorizontal: 16, marginBottom: 40 }}>
            <TouchableOpacity
              style={[styles.cancelBtn, !canCancel && styles.disabledButton]}
              onPress={() => handleCancelPress(o)}
              activeOpacity={0.7}
              disabled={!canCancel}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={20}
                color={!canCancel ? "#999" : "#B00020"}
              />
              <Text style={[styles.cancelBtnText, !canCancel && { color: "#999" }]}>
                {canCancel ? "Cancel Order" : "Cancellation Closed"}
              </Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Delivery Address Section */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color="#0C3415"
            />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.addressText}>
              {o.delivery_address?.address_line}
            </Text>
            <Text style={styles.addressText}>
              {o.delivery_address?.city}, {o.delivery_address?.state}
            </Text>
            <View style={styles.pincodeContainer}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color="#666"
              />
              <Text style={styles.pincodeText}>
                Pincode: {o.delivery_address?.pincode}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView >
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating size="large" color="#0C3415" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color="#E57373"
          />
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={loadOrders} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : selectedOrder ? (
        renderDetails()
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={80}
            color="#e0e0e0"
          />
          <Text style={styles.emptyTitle}>No {activeTab} orders</Text>
          <Text style={styles.emptyText}>
            Your {activeTab} orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadOrders}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#0C3415",
  },
  tabText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 13,
  },
  activeTabText: {
    color: "#fff",
  },
  badge: {
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0C3415",
  },
  activeBadgeText: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  orderId: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  amount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0C3415",
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#B00020",
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: "#FFF5F5",
  },
  cancelBtnText: {
    color: "#B00020",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  error: {
    color: "#E57373",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: "#0C3415",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  backBtnText: {
    color: "#0C3415",
    fontWeight: "700",
    fontSize: 16,
  },
  detailHeader: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
  },
  detailAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  detailAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0C3415",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#111",
  },
  sectionContent: {
    padding: 16,
  },
  menuName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  menuItemType: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },
  addressText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 6,
  },
  pincodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  pincodeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
});
