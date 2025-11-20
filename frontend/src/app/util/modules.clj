;; This Source Code Form is subject to the terms of the Mozilla Public
;; License, v. 2.0. If a copy of the MPL was not distributed with this
;; file, You can obtain one at http://mozilla.org/MPL/2.0/.
;;
;; Copyright (c) KALEIDOS INC

(ns app.util.modules
  (:refer-clojure :exclude [load resolve])
  (:require
   [cljs.analyzer :as ana]
   [cljs.compiler :as comp]
   [cljs.env :as env]))

(defn- module-for-ns [env ns]
  (let [mod (get-in @env/*compiler* [:shadow.build/ns->mod ns])]
    (when-not mod
      (throw (ana/error env (str "Could not find module for ns: " ns))))
    mod))

(defn- module-output-path
  [env module]
  (let [modules (get-in @env/*compiler* [:shadow.build.cljs-bridge/state :shadow.build.modules/config])]
    (get-in modules [(keyword module) :output-name])))

(defmacro resolve
  [thing]
  (assert (qualified-symbol? thing) "expected qualified keyword")

  (let [current-ns (-> &env :ns :name)
        ns         (-> thing (namespace) (symbol))
        module     (module-for-ns &env ns)
        path       (module-output-path &env module)]
    (swap! env/*compiler* assoc-in [::ana/namespaces current-ns ::ns-refs ns] module)
    `(vector
      (str "./" ~path)
      (fn* [] ~(list 'js* (str (comp/munge thing)))))))

(defmacro load
  [thing]
  `(let [[module-path# deref-fn#] (app.util.modules/resolve ~thing)]
     (-> (shadow.esm/dynamic-import module-path#)
         (.then (fn [_#]
                  (cljs.core/js-obj "default" (deref-fn#)))))))

(defmacro load-fn
  [thing]
  `(let [[module-path# deref-fn#] (app.util.modules/resolve ~thing)]
     (-> (shadow.esm/dynamic-import module-path#)
         (.then (fn [_#]
                  (deref-fn#))))))
