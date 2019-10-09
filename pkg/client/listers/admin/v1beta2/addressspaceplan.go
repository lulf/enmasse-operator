/*
 * Copyright 2018-2019, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

// Code generated by lister-gen. DO NOT EDIT.

package v1beta2

import (
	v1beta2 "github.com/enmasseproject/enmasse/pkg/apis/admin/v1beta2"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/tools/cache"
)

// AddressSpacePlanLister helps list AddressSpacePlans.
type AddressSpacePlanLister interface {
	// List lists all AddressSpacePlans in the indexer.
	List(selector labels.Selector) (ret []*v1beta2.AddressSpacePlan, err error)
	// AddressSpacePlans returns an object that can list and get AddressSpacePlans.
	AddressSpacePlans(namespace string) AddressSpacePlanNamespaceLister
	AddressSpacePlanListerExpansion
}

// addressSpacePlanLister implements the AddressSpacePlanLister interface.
type addressSpacePlanLister struct {
	indexer cache.Indexer
}

// NewAddressSpacePlanLister returns a new AddressSpacePlanLister.
func NewAddressSpacePlanLister(indexer cache.Indexer) AddressSpacePlanLister {
	return &addressSpacePlanLister{indexer: indexer}
}

// List lists all AddressSpacePlans in the indexer.
func (s *addressSpacePlanLister) List(selector labels.Selector) (ret []*v1beta2.AddressSpacePlan, err error) {
	err = cache.ListAll(s.indexer, selector, func(m interface{}) {
		ret = append(ret, m.(*v1beta2.AddressSpacePlan))
	})
	return ret, err
}

// AddressSpacePlans returns an object that can list and get AddressSpacePlans.
func (s *addressSpacePlanLister) AddressSpacePlans(namespace string) AddressSpacePlanNamespaceLister {
	return addressSpacePlanNamespaceLister{indexer: s.indexer, namespace: namespace}
}

// AddressSpacePlanNamespaceLister helps list and get AddressSpacePlans.
type AddressSpacePlanNamespaceLister interface {
	// List lists all AddressSpacePlans in the indexer for a given namespace.
	List(selector labels.Selector) (ret []*v1beta2.AddressSpacePlan, err error)
	// Get retrieves the AddressSpacePlan from the indexer for a given namespace and name.
	Get(name string) (*v1beta2.AddressSpacePlan, error)
	AddressSpacePlanNamespaceListerExpansion
}

// addressSpacePlanNamespaceLister implements the AddressSpacePlanNamespaceLister
// interface.
type addressSpacePlanNamespaceLister struct {
	indexer   cache.Indexer
	namespace string
}

// List lists all AddressSpacePlans in the indexer for a given namespace.
func (s addressSpacePlanNamespaceLister) List(selector labels.Selector) (ret []*v1beta2.AddressSpacePlan, err error) {
	err = cache.ListAllByNamespace(s.indexer, s.namespace, selector, func(m interface{}) {
		ret = append(ret, m.(*v1beta2.AddressSpacePlan))
	})
	return ret, err
}

// Get retrieves the AddressSpacePlan from the indexer for a given namespace and name.
func (s addressSpacePlanNamespaceLister) Get(name string) (*v1beta2.AddressSpacePlan, error) {
	obj, exists, err := s.indexer.GetByKey(s.namespace + "/" + name)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, errors.NewNotFound(v1beta2.Resource("addressspaceplan"), name)
	}
	return obj.(*v1beta2.AddressSpacePlan), nil
}