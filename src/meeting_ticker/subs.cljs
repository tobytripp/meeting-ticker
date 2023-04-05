(ns meeting-ticker.subs
  (:require
   [re-frame.core :as re-frame]))

(re-frame/reg-sub
 ::start-date
 (fn [db]
   (:start-date db)))

(re-frame/reg-sub
 ::started-at
 (fn [db] (:started-at db)))

(re-frame/reg-sub
 ::form
 (fn [db [_ id]]
   (cljs.pprint/pprint db)
   (get-in db [:form id])))
