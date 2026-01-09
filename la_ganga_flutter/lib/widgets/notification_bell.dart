
import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../supabase/config.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationBell extends StatelessWidget {
  final String? userId;
  final NotificationService _service = NotificationService();

  NotificationBell({super.key, this.userId});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AppNotification>>(
      stream: _service.streamNotifications(userId: userId),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          debugPrint('Notification error: ${snapshot.error}');
          return IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {},
          );
        }

        final notifications = snapshot.data ?? [];
        final unreadCount = notifications.where((n) => !n.isRead).length;

        return Stack(
          alignment: Alignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Colors.white),
              onPressed: () => _showNotifications(context, notifications),
            ),
            if (unreadCount > 0)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    unreadCount > 9 ? '9+' : unreadCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  void _showNotifications(BuildContext context, List<AppNotification> notifications) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return Container(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notificaciones',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      if (notifications.any((n) => !n.isRead))
                        TextButton(
                          onPressed: () async {
                             await _service.markAllAsRead(userId);
                             Navigator.pop(context); // Close to refresh stream visual or just wait for stream update
                          },
                          child: const Text('Marcar todas leídas', style: TextStyle(fontSize: 12)),
                        ),
                    ],
                  ),
                ),
                const Divider(),
                if (notifications.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(40),
                    child: Column(
                      children: [
                        Icon(Icons.notifications_off_outlined, size: 40, color: Colors.grey),
                        SizedBox(height: 10),
                        Text('No tienes notificaciones', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  )
                else
                  Expanded(
                    child: ListView.builder(
                      itemCount: notifications.length,
                      itemBuilder: (context, index) {
                        final notif = notifications[index];
                        return ListTile(
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: notif.isRead ? Colors.grey[100] : Colors.green[50],
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              notif.type == 'new_order' ? Icons.shopping_bag : Icons.local_shipping,
                              color: notif.isRead ? Colors.grey : Colors.green,
                              size: 20,
                            ),
                          ),
                          title: Text(
                            notif.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: notif.isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(notif.message, style: const TextStyle(fontSize: 12)),
                              const SizedBox(height: 4),
                              Text(
                                timeago.format(notif.createdAt, locale: 'es'),
                                style: TextStyle(fontSize: 10, color: Colors.grey[400]),
                              ),
                            ],
                          ),
                          trailing: !notif.isRead
                              ? IconButton(
                                  icon: const Icon(Icons.check_circle_outline, size: 16, color: Colors.green),
                                  onPressed: () async {
                                    await _service.markAsRead(notif.id);
                                    // The stream will auto-update the UI
                                  },
                                )
                              : null,
                        );
                      },
                    ),
                  ),
              ],
            ),
          );
        }
      ),
    );
  }
}
