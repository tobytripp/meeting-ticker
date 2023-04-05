(ns meeting-ticker.core-test
  (:require [cljs.test :refer-macros [deftest testing is]]
            [meeting-ticker.core :as core]))

(deftest fake-test
  (testing "fake description"
    (is (= 1 2))))
