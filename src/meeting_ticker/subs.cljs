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

(defn str->time [time-str]
  (let [[hour minute] (map js/parseInt (clojure.string/split time-str #":"))]
    (js/Date. (.setHours (js/Date.) hour minute 0))))

(re-frame/reg-sub
 ::cost
 (fn [db]
   (let [time-str   (get-in db [:form :start-time])
         now        (get db :time)
         start-time (str->time time-str)
         burn-rate  (/ (* (get-in db [:form :rate])
                             (get-in db [:form :attendees]))
                          3600)
         elapsed-s  (/ (- now start-time) 1000)]
     (cljs.pprint/pprint now)
     (cljs.pprint/pprint start-time)
     (cljs.pprint/pprint elapsed-s)
     (* burn-rate elapsed-s)
     )))
