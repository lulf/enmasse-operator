/*
 * Copyright 2017-2018, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */
package io.enmasse.user.api;

import io.enmasse.user.model.v1.User;
import io.enmasse.user.model.v1.UserList;

import java.util.Map;
import java.util.Optional;

public interface UserApi {
    Optional<User> getUserWithName(String realm, String name);
    void createUser(String realm, User user);
    boolean replaceUser(String realm, User user);
    void deleteUser(String realm, User user);

    UserList listUsers(String namespace);
    UserList listUsersWithLabels(String namespace, Map<String, String> labels);
    void deleteUsers(String namespace);
}
