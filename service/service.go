// Copyright 2019 tree xie
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package service

import (
	jsoniter "github.com/json-iterator/go"
	"github.com/vicanso/tiny-site/helper"
	"github.com/vicanso/tiny-site/log"
	"github.com/vicanso/tiny-site/util"
)

var (
	standardJSON = jsoniter.ConfigCompatibleWithStandardLibrary

	redisGetClient = helper.RedisGetClient

	pgCreate       = helper.PGCreate
	pgGetClient    = helper.PGGetClient
	pgFormatOrder  = helper.PGFormatOrder
	pgFormatSelect = helper.PGFormatSelect

	nowString = util.NowString
	logger    = log.Default()

	redisSrv = new(RedisSrv)
)
