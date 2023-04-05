(ns meeting-ticker.events
  (:require
   [re-frame.core :as re-frame]
   [meeting-ticker.db :as db]
   ))

(re-frame/reg-event-db
 ::initialize-db
 (fn [_ _]
   db/default-db))

(re-frame/reg-event-db
 ::timer
 (fn [db [_ new-time]]
   (assoc db :time new-time)))

(re-frame/reg-event-db
 ::start-ticker
 (fn [db [_ start-time]]
   (assoc db :started-at start-time)))

(re-frame/reg-event-db
 ::update-form
 (fn [db [_ id val]]
   (assoc-in db [:form id] val)))
